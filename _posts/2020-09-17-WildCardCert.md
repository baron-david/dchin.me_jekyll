---
title: LetsEncrypt Wildcard Cert
layout: default
---

### This code was run to get my wildcard cert.

```
sudo apt-get install letsencrypt

sudo certbot certonly --manual --preferred-challenges=dns --email systemdchin@gmail.com --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d *.daveops.app

```

### Some useful info on what to do next and how to renew.

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name
_acme-challenge.daveops.app with the following value:

6IdN9vq-hjrW8OaNjkPoS2UeKQzJAVkN4aL_TNkR_QQ

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/daveops.app/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/daveops.app/privkey.pem
   Your cert will expire on 2020-12-17. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

 - We were unable to subscribe you the EFF mailing list because your
   e-mail address appears to be invalid. You can try again later by
   visiting https://act.eff.org.

   ```