import { useState, useEffect } from "react";

export default function useNotification() {
  const [price, setPrice] = useState(
    () => localStorage.getItem("settings.notif.price") !== "0"
  );

  const [dividend, setDividend] = useState(
    () => localStorage.getItem("settings.notif.dividend") === "1"
  );

  const [weekly, setWeekly] = useState(
    () => localStorage.getItem("settings.notif.weekly") !== "0"
  );

  useEffect(() => {
    localStorage.setItem("settings.notif.price", price ? "1" : "0");
  }, [price]);

  useEffect(() => {
    localStorage.setItem(
      "settings.notif.dividend",
      dividend ? "1" : "0"
    );
  }, [dividend]);

  useEffect(() => {
    localStorage.setItem("settings.notif.weekly", weekly ? "1" : "0");
  }, [weekly]);

  return {
    price,
    setPrice,
    dividend,
    setDividend,
    weekly,
    setWeekly,
  };
}