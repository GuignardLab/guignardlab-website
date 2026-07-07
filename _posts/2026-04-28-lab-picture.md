---
title: Photos of the lab
image: images/lab-pictures/2026-lab-picture-1.jpeg
author: leo-guignard
tags: lab, social
---

A round of lab pictures.

{% capture gallery %}
{%
  include figure.html
  image="images/lab-pictures/2026-lab-picture-1.jpeg"
  caption="Lab picture 1"
%}
{%
  include figure.html
  image="images/lab-pictures/2026-lab-picture-2.jpeg"
  caption="Lab picture 2"
%}
{% endcapture %}
{% include grid.html content=gallery %}
