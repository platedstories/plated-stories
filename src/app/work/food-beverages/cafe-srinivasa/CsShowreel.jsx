"use client";
import Showreel from "@/components/Showreel/Showreel";

// Share the homepage showcase while keeping this case study's own media.
const CsShowreel = ({ media = [], label }) =>
  media.length ? <Showreel media={media} label={label} /> : null;

export default CsShowreel;
