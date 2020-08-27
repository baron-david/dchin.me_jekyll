---
layout: default
title: Wake Lock
permalink: /wakelock/
order: 900
---
This page should prevent a session from sleeping in Chrome 84+.

Windows shortcut to open a small window.
```
"C:\Program Files (x86)\Google\Chrome\Application\chrome_proxy.exe" --chrome-frame --user-data-dir="%tmp%\chrome_tmp_user_dir" --window-size=100,100 --window-position=1,1  --app=https://dchin.me
```
[wakelock.lnk](/assets/wakelock.lnk).

Run this in cmd to verify wake lock
```
powercfg /requests
```



<script>
//comment
	navigator.wakeLock.request("screen");

	const handleVisibilityChange = () => {
	  if (document.visibilityState === 'visible') {
		navigator.wakeLock.request("screen");
	  }
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);
</script>
