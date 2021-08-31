---
inject: true
to: <%= file %>
before: // \[hygen\] Add imports
skip_if: <%= skip_if %>
---

{% if (locals.imports) { -%>
<%- imports %>
<% } -%>
