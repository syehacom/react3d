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
    // タッチした座標から小さい円の半径を差し引いた外周の座標
    let coordinates = {
      x: touchX - smallRadius,
      y: touchY - smallRadius,
    };

    let angle =
      // atan2でラジアンを算出し角度を計算し角度に変換
      Math.atan2(largeRadius - touchY, largeRadius - touchX) * (180 / Math.PI);

    // 大きい円の半径と座標と斜辺のうち小さい値を返す
    let minDist = Math.min(
      Math.hypot(touchX - largeRadius, touchY - largeRadius), // 座標間の距離
      largeRadius
    );
    // 半径と斜辺が同じとき＝大きい円と小さい円の外周が接しているとき
    if (minDist === largeRadius) {
      if (angle < 0) {
        // -の場合Math.absで絶対数を取得、角度からラジアンに変換、正のx軸の間
        let rad =
          largeRadius -
          smallRadius +
          minDist * Math.cos((180 - Math.abs(angle)) * (Math.PI / 180));
        setX(
          largeRadius - smallRadius + minDist * Math.cos(rad * (Math.PI / 180))
        );
        setY(
          largeRadius - smallRadius + minDist * Math.sin(rad * (Math.PI / 180))
        );
        onMove({
          x: x,
          y: y,
        });
        console.log({
          angle,
          rad,
          x: x,
          y: y,
        });
      } else {
        let rad =
          largeRadius -
          smallRadius +
          minDist * Math.cos((angle + 180) * (Math.PI / 180));
        setX(
          largeRadius - smallRadius + minDist * Math.cos(rad * (Math.PI / 180))
        );
        setY(
          largeRadius - smallRadius + minDist * Math.sin(rad * (Math.PI / 180))
        );
        onMove({
          x: x,
          y: y,
        });
        console.log({
          x: x,
          y: y,
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
            width: 2 * largeRadius, // 半径 * 2
            height: 2 * largeRadius,
            borderRadius: largeRadius,
            backgroundColor: "black",
            // transform: [{ rotateX: "180deg" }],
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
