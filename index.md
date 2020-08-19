---
layout: homepage
category: system
---

# Hello World!

![Chicken Rider](/assets/images/IMG_1295.png)


{% assign mypages = site.pages | sort: "order" %}
| 
{% for page in mypages %}
	{% if page.title and page.category != "system" %}
		<a href="{{ page.url | absolute_url }}">{{ page.title }}</a> |
	{% endif %}
{% endfor %}
