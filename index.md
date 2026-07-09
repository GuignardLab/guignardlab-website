---
title: Guignard Lab
description: The Guignard Lab develops computational methods to quantify morphogenesis at single-cell resolution, at the intersection of computer vision, machine learning, and developmental biology.
---

# Guignard Lab

<video autoplay loop muted playsinline style="display:block;margin:1rem auto;max-width:400px;width:100%;clip-path:inset(10px 60px 0 60px)" id="labvideo">
  <source src="images/logo-guignardlab-movie.mp4" type="video/mp4">
</video>

We develop computational methods to quantify morphogenesis at the single-cell scale in whole organisms throughout their development. Our research sits at the intersection of computer vision, machine learning, and developmental biology.

{% include section.html %}

## Highlights

<script src="_scripts/voronoi_canvas.js"></script>

{% capture text %}

How do embryos reproducibly build complex organisms from a single cell? We develop algorithms and pipelines — combining graph methods, machine learning, and big data — to analyze fluorescence microscopy and spatial transcriptomics data at single-cell resolution.

{%
  include button.html
  link="research"
  text="See our publications"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="research"
  title="Our Research"
  text=text
%}

{% capture text %}

We build open-source tools for 3D image registration, spatial transcriptomics analysis, organoid quantification, and lineage tree handling — designed to be reusable by the broader community.

{%
  include button.html
  link="software"
  text="Browse our software"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="software"
  title="Our Software"
  flip=true
  style="bare"
  text=text
%}

{% capture text %}

We are a diverse team of computer scientists, physicists, biologists, and mathematicians based at IBDM & the Turing Centre for Living Systems, Aix-Marseille Université & CNRS, Marseille.

{%
  include button.html
  link="team"
  text="Meet our team"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  id="ourteam"
  link="team"
  title="Our Team"
  text=text
%}

{% assign pictures = "" | split: "," %}
{% assign postdata = site.posts | sort: "date" | reverse %}
{% for post in postdata %}
  {% if post.image %}
    {% assign pictures = pictures | push: post.image %}
  {% endif %}
{% endfor %}
<script>
  const pictures = {{ pictures | jsonify }};

  const ourteam = document.getElementById("ourteam");
  if (pictures.length > 0 && ourteam) {
    const randomImage = pictures[Math.floor(Math.random()**2 * pictures.length)];
    ourteam.src = randomImage;
  }
</script>