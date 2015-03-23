[Gitlab](http://www.gitlab.com) is an open source 'clone' of Github. I use it at work, where I am also the main admin for it and the server it runs on. I work on a very small team of developers, and the Pro version of Gitlab is not required, and unlike with Github, we still use this very fine piece of software for free with almost no restrictions.

The integration with Active Directory is of great benefit. To get the most out of it, I think that you would need to upgrade to the pro version of gitlab, as it adds a number of additonal integrations which look to be really usefull for larger teams. As I said, I work on a small team, so 

    ldap:
    enabled: true
      servers:
        main:
          label: 'domain'
          host: 'ad.example.com'
          port: 389 #636 #389
          uid: 'sAMAccountName'
          method: 'plain' # "ssl" or "plain"
          bind_dn: 'CN=Git Lab,OU=AB,OU=example,DC=example,DC=com'
          password: 'secret'
          allow_username_or_email_login: true
          active_directory: true
          base: 'OU=example,DC=example,DC=com'
          user_filter: '(memberOf=cn=devs,ou=groups,dc=example,dc=com)'
