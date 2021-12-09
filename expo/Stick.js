import React, { useState } from "react";
import { View, Text } from "react-native";

export default function Stick(props) {
  const { onMove } = props;

  const largeRadius = 150; // 大きい円の半径
  const smallRadius = largeRadius / 3; // 小さい円の半径

  const [x, setX] = useState(largeRadius - smallRadius); // 大きい円の半径 - 小さい円の半径の差 x
  const [y, setY] = useState(largeRadius - smallRadius); // 大きい円の半径 - 小さい円の半径の差 y

  const handleTouchMove = (e) => {
    const touchX = e.nativeEvent.locationX; // 画面をタッチしたときのx座標
    const touchY = e.nativeEvent.locationY; // 画面をタッチしたときのy座標
    // 小さい円の半径を差し引く
    let coordinates = {
      x: touchX - smallRadius,
      y: touchY - smallRadius,
    };

    const angle = calcAngle(
      { x: touchX, y: touchY },
      { x: largeRadius, y: largeRadius }
    );

    let dist = calcDistance(
      { x: largeRadius, y: largeRadius },
      { x: touchX, y: touchY }
    );
    minDist = Math.min(dist, largeRadius);
    if (minDist === largeRadius) {
      coordinatess = findCoord(
        { x: largeRadius, y: largeRadius },
        minDist,
        angle
      );
      coordinatess = {
        x: coordinatess.x - smallRadius,
        y: coordinatess.y - smallRadius,
      };
      setX(coordinatess.x);
      setY(coordinatess.y);
      onMove(coordinatess);
      console.log(coordinatess);
    } else {
      setX(coordinates.x);
      setY(coordinates.y);
      onMove(coordinates);
    }
  };

  const handleTouchEnd = (e) => {
    setX(largeRadius - smallRadius);
    setY(largeRadius - smallRadius);
  };

  const calcDistance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calcAngle = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const rawAngle = radiansToDegrees(Math.atan2(dy, dx));
    if (rawAngle < 0) return 180 - Math.abs(rawAngle);
    else return rawAngle + 180;
  };

  const degreesToRadians = (a) => {
    return a * (Math.PI / 180);
  };

  const radiansToDegrees = (a) => {
    return a * (180 / Math.PI);
  };

  const findCoord = (position, distance, angle) => {
    const b = { x: 0, y: 0 };
    angle = degreesToRadians(angle);
    b.x = position.x + distance * Math.cos(angle);
    b.y = position.y + distance * Math.sin(angle);
    if (b.y < 0) b.y += 150;
    return b;
  };

  return (
    <>
      <View
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: 2 * largeRadius,
          height: 2 * largeRadius,
          borderRadius: largeRadius,
          backgroundColor: "black",
          transform: [{ rotateX: "180deg" }],
        }}
      >
        <View
          pointerEvents="none"
          style={{
            height: 2 * smallRadius,
            width: 2 * smallRadius,
            borderRadius: smallRadius,
            backgroundColor: "blue",
            position: "absolute",
            transform: [{ translateX: x }, { translateY: y }],
          }}
        />
      </View>
      <Text>
        x:{Math.trunc(x)}, y:{Math.trunc(y)}
      </Text>
    </>
  );
}
