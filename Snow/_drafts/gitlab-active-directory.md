Gitlab and active directory

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
