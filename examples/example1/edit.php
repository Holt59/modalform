<?php

header('Access-Control-Origin: *');

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