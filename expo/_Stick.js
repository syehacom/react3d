import React, { useState } from "react";
import { View, Text } from "react-native";

export default function Stick(props) {
  const { onMove } = props;

  const bigRadius = 90; // 大きい円の半径
  const smallRadius = bigRadius / 3; // 小さい円の半径
  const [x, setX] = useState(bigRadius - smallRadius * 2); // 大きい円の中心 - 小さい円の中心
  const [y, setY] = useState(bigRadius - smallRadius * 2); // 大きい円の中心 - 小さい円の中心

  const handleTouchMove = (e) => {
    const touchX = e.nativeEvent.locationX; // 画面をタッチしたときのx座標
    const touchY = e.nativeEvent.locationY; // 画面をタッチしたときのy座標

    // 小さい円の半径を差し引く
    let coordinates = {
      x: touchX - smallRadius,
      y: touchY - smallRadius,
    };
    // 三平方の定理で座標(touchX,touchY)と原点の距離を出す
    let distance = Math.sqrt(
      (touchX - bigRadius) * (touchX - bigRadius) + // 大きい円の中心とタッチしているx座標との距離
        (touchY - bigRadius) * (touchY - bigRadius)
    );

    let calcDistance = Math.min(distance, bigRadius); // distance と bigRadius のうち小さい値を返す

    if (calcDistance === bigRadius) {
      if (
        Math.atan2(bigRadius - touchY, bigRadius - touchX) * (180 / Math.PI) <
        0 // 角度に変換 マイナスの場合で分岐
      ) {
        const calcAngle =
          180 -
          Math.abs(
            Math.atan2(bigRadius - touchY, bigRadius - touchX) * (180 / Math.PI)
          );
        if (
          bigRadius + calcDistance * Math.sin(calcAngle * (Math.PI / 180)) <
          0
        ) {
          coordinates = {
            x:
              bigRadius +
              calcDistance * Math.cos(calcAngle * (Math.PI / 180)) -
              smallRadius,
            y:
              bigRadius +
              calcDistance * Math.sin(calcAngle * (Math.PI / 180)) +
              150 -
              smallRadius,
          };
        } else {
          coordinates = {
            x:
              bigRadius +
              calcDistance * Math.cos(calcAngle * (Math.PI / 180)) -
              smallRadius,
            y:
              bigRadius +
              calcDistance * Math.sin(calcAngle * (Math.PI / 180)) -
              smallRadius,
          };
        }
      } else {
        const calcAngle =
          Math.atan2(bigRadius - touchY, bigRadius - touchX) * (180 / Math.PI) +
          180;
        if (
          bigRadius + calcDistance * Math.sin(calcAngle * (Math.PI / 180)) <
          0
        ) {
          coordinates = {
            x:
              bigRadius +
              calcDistance * Math.cos(calcAngle * (Math.PI / 180)) -
              smallRadius,
            y:
              bigRadius +
              calcDistance * Math.sin(calcAngle * (Math.PI / 180)) +
              150 -
              smallRadius,
          };
        } else {
          coordinates = {
            x:
              bigRadius +
              calcDistance * Math.cos(calcAngle * (Math.PI / 180)) -
              smallRadius,
            y:
              bigRadius +
              calcDistance * Math.sin(calcAngle * (Math.PI / 180)) -
              smallRadius,
          };
        }
      }
    }
    setX(coordinates.x);
    setY(coordinates.y);
    onMove(coordinates);
  };

  const handleTouchEnd = (e) => {
    // タッチが終了すると初期座標に戻る
    setX(bigRadius - smallRadius);
    setY(bigRadius - smallRadius);
  };

  return (
    <>
      <View
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={[
          {
            height: bigRadius * 2,
            width: bigRadius * 2,
            borderRadius: smallRadius,
            backgroundColor: "black",
            transform: [{ rotateY: "180deg" }], // y軸を反転
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            {
              height: smallRadius * 2,
              width: smallRadius * 2,
              borderRadius: smallRadius,
              backgroundColor: "blue",
              position: "absolute",
              transform: [{ translateX: x }, { translateY: y }],
            },
          ]}
        />
      </View>
      <Text>
        x:{Math.trunc(x)}, y:{Math.trunc(y)}
      </Text>
    </>
  );
}
