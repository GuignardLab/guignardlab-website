---
title: Team
nav:
  order: 3
  tooltip: About our team
---

# {% include icon.html icon="fa-solid fa-users" %}Team

We are a diverse team of computer scientists, physicists, biologists, and mathematicians based at Aix-Marseille Université and [CENTURI](https://centuri-livingsystems.org) — the Centre for Living Systems Integration in Marseille, France. We are always looking for motivated students and postdocs; see our [contact page](../contact) for how to apply.

{% include section.html %}

{% include list.html data="members" component="portrait" filter="role == 'pi'" %}
{% include list.html data="members" component="portrait" filter="role != 'pi' and !group" %}

{% include section.html %}

## Alumni

{% include list.html data="members" component="portrait" filter="group == 'alum'" style="small" %}
