---
layout: default
title: Posts
permalink: /posts/
---

### List of Posts:
<ol>
{% for post in site.posts %}
    <li><a href="{{ post.url }}">{{ post.title}}</a>
    <span class="postDate">{{ post.date | date: "%b %-d, %Y" }}</span>
    </li>
{% endfor %}
</ol>