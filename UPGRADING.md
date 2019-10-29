# Upgrading guide

Any major version changes will have their upgrade guide listed here.

## Upgrading from 0.3.0 to 1.0.0

### ajaxOptions

`ajaxOptions` option now takes a method requiring 3 parameters instead of 2.

The parameters are `multiListControl, query, callback` instead of `query, callback`.