"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import data from "@emoji-mart/data";
import { init } from "emoji-mart";
import { useDispatch } from "react-redux";
import {
  setEmoji,
  setMood,
  setMoodDate,
} from "@/Redux/features/mood/moodSlice";
import { defaultMoods } from "@/data";

const EmojiSelector = () => {
  //Mood
  const [moodEmoji, setMoodEmoji] = useState("😀");
  const [moodText, setMoodText] = useState("Awesome");
  const [value, setValue] = useState(0);
  const router = useRouter();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    setMoodEmoji(defaultMoods[newValue].emoji);
    setMoodText(defaultMoods[newValue].mood);
  };

  const handleMouseUp = () => {
    dispatch(setEmoji(moodEmoji));
    dispatch(setMood(moodText));
    dispatch(setMoodDate(new Date()));
    router.push("/user/journaling-feature");
  };
  useEffect(() => {
    init({ data });
  }, []);
  return (
    <div className="text-center">
      <em-emoji native={moodEmoji} size="4em"></em-emoji>
      <p
        className={`text-center h5 ${
          moodText == "Awesome"
            ? "text-success"
            : moodText == "Fine"
            ? "text-info"
            : moodText == "Not fine"
            ? "text-warning"
            : "text-danger"
        }`}
      >
        {moodText}
      </p>
      <div className="d-flex align-items-center gap-2 justify-content-center mt-2">
        {/* <p className="text-success">Yay!</p> */}
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={value}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
        />
        {/* <p className="text-danger">GTFO!</p> */}
      </div>
    </div>
  );
};

export default EmojiSelector;
