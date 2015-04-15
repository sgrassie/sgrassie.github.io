---
layout: post 
published: 15/04/2015
title: Gitlab and Active Directory
category: asp.net, bootstrap 
metadescription: Gitlab and Active Directory
---
[Gitlab](http://www.gitlab.com) is an open source 'clone' of Github, although I don't think it's much of a clone anymore, to be fair. The Enterprise edition has full Active Directory support, and the Community edition does not. 

The integration with Active Directory is of great benefit. To get the most out of it, I think that you would need to upgrade to the Enterprise edition, as it adds a number of additonal integrations which look to be really usefull for larger organisations with multiple projects and development teams.

It is possible to configure the Community edition to integrate with Active Directory, to the extent that you can restrict exactly who is allowed to login in. You have to manually configure the users permissions on groups/projects though. In the Enterprise edition, the tighter integration means that you can match up Active Directory groups with groups in Gitlab, and control access both to the server, and groups/projects, all through Active Directory.

Here is the ldap section from my `gitlab.yml` (please be aware, I'm no Active Directory expert):

    ldap:
    enabled: true
      servers:
        main:
          label: 'domain'
          host: 'ad.example.com'
          port: 389 
          uid: 'sAMAccountName'
          method: 'plain' 
          bind_dn: 'CN=Git Lab,OU=AB,OU=example,DC=example,DC=com'
          password: 'secret'
          allow_username_or_email_login: true
          active_directory: true
          base: 'OU=example,DC=example,DC=com'
          user_filter: '(memberOf=cn=devs,ou=groups,dc=example,dc=com)'

The `bind_dn` is for a user called 'Git Lab', and you must suppoly the password. This user was expressly setup just for this, but you can use any user. The `base` is the level of Active Directory that Gitlab searches for users from. Finally, the `user_filter` states that users must members of `devs` in order to be able to login.
