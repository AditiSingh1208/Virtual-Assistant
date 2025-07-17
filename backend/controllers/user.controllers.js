import { json, response } from 'express';
import uploadOnCloudinary from '../config/cloudinary.js';
import geminieResponse from '../gemini.js';
import User from '../models/user.model.js'
import moment from 'moment/moment.js';

export const getCurrentUser =async (req, res) => {
    try {
        const userId = req.userId // Assuming userId is set by the authentication middleware
        const user = await User.findById(userId).select('-password'); // Exclude password and version field
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json({message: "Get current user error"});
    }
}

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;
        let assistantImage;

        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path);
        } else {
            assistantImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { assistantName, assistantImage },
            { new: true }
        ).select("-password");

        return res.status(200).json(user); // ✅ send the user directly
    } catch (error) {
        return res.status(400).json({ message: "Update assistant error" });
    }
}



export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    console.log("👉 Received command:", command);

    if (!command || typeof command !== 'string' || command.trim() === '') {
      return res.status(400).json({ message: 'Missing or invalid "command"' });
    }

    const user = await User.findById(req.userId);
    user.history.push(command)
    user.save()
    const userName = user?.name;
    const assistantName = user?.assistantName;

    console.log("🧠 Calling Gemini with:", { command, assistantName, userName });

    let result;
    try {
      result = await geminieResponse(command, assistantName, userName);
      console.log("✅ Gemini raw result:", result);
    } catch (err) {
      console.error("❌ Gemini API failed:", err);
      return res.status(500).json({ message: "Gemini API failed", error: err.message });
    }

    if (typeof result !== 'string') {
      return res.status(500).json({ message: "Invalid response type from Gemini", result });
    }

    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.warn("⚠️ Could not extract JSON from Gemini result:", result);
      return res.status(400).json({ message: "Gemini response not valid JSON format" });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return res.status(400).json({ message: "Failed to parse Gemini response", error: err.message });
    }

    const type = gemResult.type;

    // Respond based on type
    switch (type) {
      case 'get-date':
        return res.json({ type, userInput: gemResult.userInput, response: `current date is ${moment().format('YYYY-MM-DD')}` });

      case 'get-time':
        return res.json({ type, userInput: gemResult.userInput, response: `current time is ${moment().format('hh:mm:A')}` });

      case 'get-day':
        return res.json({ type, userInput: gemResult.userInput, response: `Today is ${moment().format('dddd')}` });

      case 'get-month':
        return res.json({ type, userInput: gemResult.userInput, response: `Current month is ${moment().format('MMMM')}` });

      case 'joke':
        return res.json({ type, userInput: gemResult.userInput, response: `"Why did the computer go to the doctor? Because it had a virus!"`});

      case 'quote':
        return res.json({ type, userInput: gemResult.userInput, response:`"The only way to do great work is to love what you do." By – Steve Jobs`});




      // general + all other types
      case 'general':
      case 'google-search':
      case 'youtube-play':
      case 'wikipedia-search':
      case 'weather-show':
      case 'news':
      case 'joke':
      case 'calculator-open':
      case 'instagram-open':
      case 'facebook-open':
      case 'twitter-open':
      case 'linkedin-open':
      case 'github-open':
      case 'open-website':
      case 'open-app':
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        console.warn("❓ Unrecognized type from Gemini:", type);
        return res.status(400).json({ message: "I didn't understand that." });
    }


  } catch (error) {
    console.error("❌ Final catch - Ask Assistant Error:", error);
    return res.status(500).json({ message: "Ask Assistant Internal Error", error: error.message });
  }
};
