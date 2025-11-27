"use client";
import React, { useState, useEffect } from "react";
import { init } from "emoji-mart";
import { useDispatch, useSelector } from "react-redux";
import data from "@emoji-mart/data";
import { Card, CardBody } from "reactstrap";
import { setEmoji, setMood } from "@/Redux/features/mood/moodSlice";
import { defaultMoods } from "@/data";

const HowAreYou = () => {
  const dispatch = useDispatch();
  const { mood } = useSelector((state) => state.mood);
  const texts = ["Awesome", "Fine", "Not fine", "Very bad"];
  const [moodEmoji, setMoodEmoji] = useState(
    defaultMoods[texts.indexOf(mood)]?.emoji
      ? defaultMoods[texts.indexOf(mood)]?.emoji
      : "😀"
  );
  const [moodText, setMoodText] = useState(
    texts[mood ? texts.indexOf(mood) : 0]
  );
  const [value, setValue] = useState(mood ? texts.indexOf(mood) : 0);
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    setMoodEmoji(defaultMoods[newValue].emoji);
    setMoodText(texts[newValue]);

    dispatch(setEmoji(defaultMoods[newValue].emoji));
    dispatch(setMood(texts[newValue]));
  };

  useEffect(() => {
    init({ data });
  }, []);
  return (
    <Card className="feeling">
      <CardBody>
        <div className="img-overlay">
          <h1 className="text-center">How Are You?</h1>
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
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={value}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default HowAreYou;
