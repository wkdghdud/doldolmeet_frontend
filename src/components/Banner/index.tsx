"use client";

import React from "react";
import Carousel from "react-material-ui-carousel";

const imageUrls: string[] = [
  "https://pbs.twimg.com/media/F6GjqPia0AAHxaN.jpg:large",
];
export default function Banner() {
  return (
    <Carousel>
      {imageUrls.map((url, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={url}
            alt=""
            style={{
              height: "auto",
              maxHeight: 500,
              objectFit: "cover",
            }}
          />
        </div>
      ))}
    </Carousel>
  );
}
