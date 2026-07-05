#!/usr/bin/env bash
# Shared environment for the build/serve scripts.
# The Gemfile.lock needs Ruby >= 3.0, but the shell default on this machine
# is rvm's ruby-2.7.2 — so point everything at the ruby-3.0.3 install.
RUBY_303="$HOME/.rvm/rubies/ruby-3.0.3"
if [ -d "$RUBY_303" ]; then
    export PATH="$RUBY_303/bin:$HOME/.rvm/gems/ruby-3.0.3/bin:$PATH"
    export GEM_HOME="$HOME/.rvm/gems/ruby-3.0.3"
    export GEM_PATH="$HOME/.rvm/gems/ruby-3.0.3:$HOME/.rvm/gems/ruby-3.0.3@global"
fi
