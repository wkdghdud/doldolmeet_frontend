"use client";
import Image from "next/image";
import React from "react";
import Carousel from "react-material-ui-carousel";

const imageUrls: string[] = [
  "https://images.khan.co.kr/article/2023/05/09/news-p.v1.20230509.81d6231f8f364496a03089815eef0340.jpg",
  "https://img.marieclairekorea.com/2021/05/mck_609b3b60db9c2.jpg",
];
export default function Banner() {
  return (
    <Carousel>
      {imageUrls.map((url, i) => (
        <Image key={i} src={url} alt="" />
      ))}
    </Carousel>
  );
}
