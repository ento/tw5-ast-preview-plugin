{ name = "ast-preview"
, npm_packages =
  [ { name = "snabbdom"
    , version = "0.7.3"
    , untar = "--strip-components=2 --wildcards \"*/dist/*.js\" --exclude \"*.min.js\""
    }
  ]
}
