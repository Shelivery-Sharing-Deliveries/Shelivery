import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

interface TimeLeftProps {
  expireAt: string;
}

export function TimeLeft({ expireAt }: TimeLeftProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const expires = new Date(expireAt).getTime();
      const now = new Date().getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [expireAt]);

  return <Text>{timeLeft}</Text>;
}
