# ModalForm
A jQuery &amp; Bootstrap plugin to create ajax connected form.

ModalForm is a jQuery / Bootstrap plugin that allow you to create dynamic modal « forms », i.e. modal with HTML form inside that can be submited using ajax.

# Client side

First, you need to add the following javascript and css files:

```html
<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="css/ladda-themeless.min.css">

<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script type="text/javascript" src="js/spin.min.js"></script>
<script type="text/javascript" src="js/ladda.min.js"></script>
<script type="text/javascript" src="js/bootstrap-jquery-ladda.min.js"></script>
<script type="text/javascript" src="js/modalform.min.js"></script>
```

Second, you need a modal with a Bootstrap `form` inside:

```html
<div id="user-form" class="modal fade" tabindex="-1" role="dialog" aria-hidden="false">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title">User</h4>
            </div>
            <div class="modal-body">
                <form action="/users/edit" class="form-horizontal" role="form" method="post" accept-charset="utf-8">
                    <fieldset>
                        <input type="hidden" name="id" id="id" />
                        <div class="form-group required">
                            <label for="lastname" class="control-label col-md-3">Lastname</label>
                            <div class="col-md-9">
                                <input name="lastname" size="30" maxlength="64" class="form-control" type="text" id="lastname" required="required" />
                            </div>
                        </div>
                        <div class="form-group required">
                            <label for="firstname" class="control-label col-md-3">Firstname</label>
                            <div class="col-md-9">
                                <input name="firstname" size="30" maxlength="64" class="form-control" type="text" id="firstname" required="required" />
                            </div>
                        </div>
                        <div class="form-group required">
                            <label for="mail" class="control-label col-md-3">Mail</label>
                            <div class="col-md-9">
                                <input name="mail" size="30" class="form-control" type="email" id="mail" required="required" />
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-9 col-md-offset-3">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="adult" id="adult" />Adult</label>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
            <div class="modal-footer">
                <button data-dismiss="modal" class="btn btn-default">Cancel</button>
                <button data-submit="modal-form" class="btn btn-default btn-info">Submit</button>
            </div>
        </div>
    </div>
</div>
```

Finally, you need to initialize the ModalForm:
```js
$('#user-form').modalform();
```

# Server side

Data sent by the client to your server are almost the same as if ModalForm was not used. Here is an example with the form above (in PHP, but you could use any language):

```php
<?php

$id = $_POST['id'];
$lastname = $_POST['lastname'];
$firstname = $_POST['firstname'];
$mail = $_POST['mail'];
$adult = $_POST['adult'];

if (!$id) {
    // A new user need to be created (no id specified)
}

$errors = [];

// Save the user...

// If an error occurs for the field 'lastname':
$errors['lastname'] = [
    'Something went wrong!'
];

echo json_encode([
    'values' => $_POST, // You can change the values, here I just sent the POST values
    'errors' => $errors
]);

?>
```

Copyright and license
=====================

Copyright 2013 Mikaël Capelle.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
