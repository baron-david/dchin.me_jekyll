---
layout: default
title: another page
order: 500
---

## Welcome to another page

_yay_

[back](./)

This page should prevent a session from sleeping in Chrome 84+.

'powercfg /requests'

<script>

	navigator.wakeLock.request("screen");

	const handleVisibilityChange = () => {
	  if (document.visibilityState === 'visible') {
		navigator.wakeLock.request("screen");
	  }
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);


</script>