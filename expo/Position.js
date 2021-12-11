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
    // タッチした座標から小さい円の半径を差し引いた円の中心の座標
    let coordinates = {
      x: touchX - smallRadius,
      y: touchY - smallRadius,
    };

    let angle =
      // atan2でラジアンを算出する
      Math.atan2(touchY, touchX);
    console.log(angle)
    // 原点から座標の距離と大きい円の半径のうち小さい値を返す
    let minDist = Math.min(
      Math.hypot(touchX - smallRadius, touchY - smallRadius), // 原点からのの距離
      largeRadius
    );
    // 大きい円と小さい円の中心が接している座標を算出
    // ラジアンからコサインを算出し、大きい円の半径と乗算し座標を算出する
    if (minDist === largeRadius) {
      // ラジアンがマイナスの時
      // if (angle < 0) {
      //   setX(largeRadius * Math.cos(angle) - smallRadius); 
      //   setY(largeRadius * Math.sin(angle) - smallRadius);
      //   onMove({
      //     x: x,
      //     y: y,
      //   });
      // } else {
        // ラジアンがプラスの時
        setX(largeRadius * Math.cos(angle) - smallRadius);
        setY(largeRadius * Math.sin(angle) - smallRadius);
        onMove({
          x: x,
          y: y,
        });
      // }
    } else {
      setX(coordinates.x);
      setY(coordinates.y);
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
            width: 2 * largeRadius, // 半径 * 2
            height: 2 * largeRadius,
            borderRadius: largeRadius,
            backgroundColor: "black",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              height: 2 * smallRadius, // 半径 * 2
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
