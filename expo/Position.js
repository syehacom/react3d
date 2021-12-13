import React, { useState } from "react";
import { View, Text } from "react-native";

export default function Stick(props) {
  const { onMove, onEnd } = props;

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
    // atan2でラジアンを算出する
    const radian = Math.atan2(y, x);
    // 大きい円と小さい円の中心が接している座標を算出
    // ラジアンからコサインを算出し、大きい円の半径と乗算し座標を算出する
    let limitX = largeRadius - smallRadius + largeRadius * Math.cos(radian);
    let limitY = largeRadius - smallRadius + largeRadius * Math.sin(radian);
    // タッチした座標と大きい円の座標の小さい値をx座標、y座標にセットする
    setX(Math.min(coordinates.x, limitX));
    setY(Math.min(coordinates.y, limitY));
    onMove({ x: x, y: y });
  };

  const handleTouchEnd = () => {
    setX(largeRadius - smallRadius);
    setY(largeRadius - smallRadius);
    onEnd();
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
