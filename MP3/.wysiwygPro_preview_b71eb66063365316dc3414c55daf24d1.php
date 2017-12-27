<?php
if ($_GET['randomId'] != "GTAQdwolm_ue75LBCe9XHYjHBfF1DAQCuV5m2y8d4yKChnQ13wZZGNR5lCXRezje") {
    echo "Access Denied";
    exit();
}

// display the HTML code:
echo stripslashes($_POST['wproPreviewHTML']);

?>  
