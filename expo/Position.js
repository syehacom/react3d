import React, { useState } from "react";
import { View, Text } from "react-native";

export default function Stick(props) {
  const { onMove } = props;

  const largeRadius = 90; // 大きい円の半径
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

    let rawAngle =
      Math.atan2(largeRadius - touchY, largeRadius - touchX) * (180 / Math.PI);

    let minDist = Math.min(
      // 引数のうち小さい値を返す
      Math.hypot(touchX - largeRadius, touchY - largeRadius), // 座標間の距離
      largeRadius
    );

    if (minDist === largeRadius) {
      if (rawAngle < 0) {
        let angle =
          largeRadius -
          smallRadius +
          minDist * Math.cos((180 - Math.abs(rawAngle)) * (Math.PI / 180));
        setX(
          largeRadius -
            smallRadius +
            minDist * Math.cos(angle * (Math.PI / 180))
        );
        setY(
          largeRadius -
            smallRadius +
            minDist * Math.sin(angle * (Math.PI / 180))
        );
        onMove({
          x: Math.min(80, Math.max(-80, x)),
          y: Math.min(80, Math.max(-80, y)),
        });
        console.log({
          x: Math.min(80, Math.max(-80, x)),
          y: Math.min(80, Math.max(-80, y)),
        });
      } else {
        let angle =
          largeRadius -
          smallRadius +
          minDist * Math.cos((rawAngle + 180) * (Math.PI / 180));
        setX(
          largeRadius -
            smallRadius +
            minDist * Math.cos(angle * (Math.PI / 180))
        );
        setY(
          largeRadius -
            smallRadius +
            minDist * Math.sin(angle * (Math.PI / 180))
        );
        onMove({
          x: Math.min(80, Math.max(-80, x)),
          y: Math.min(80, Math.max(-80, y)),
        });
        console.log({
          x: Math.min(80, Math.max(-80, x)),
          y: Math.min(80, Math.max(-80, y)),
        });
      }
    } else {
    setX(Math.min(120, Math.max(0, coordinates.x)));
    setY(Math.min(120, Math.max(0, coordinates.y)));
    onMove({ x: x, y: y });
    }
  };

  const handleTouchEnd = () => {
    setX(largeRadius - smallRadius);
    setY(largeRadius - smallRadius);
  };

  return (
    <>
      <View>
        <Text>
          x:{Math.trunc(x - 60)}, y:{Math.trunc(y - 60)}
        </Text>
        <View
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: 2 * largeRadius,
            height: 2 * largeRadius,
            borderRadius: largeRadius,
            backgroundColor: "black",
            // transform: [{ rotateX: "180deg" }],
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
      </View>
    </>
  );
}
