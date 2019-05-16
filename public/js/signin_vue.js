
function validateForm() {

	var x = document.forms["Sign"]["pass"].value;
	var y = document.forms["Sign"]["pass_confirm"].value;

	if (x != y) {

		document.getElementByID("warning").style = "display: none"

		return false;
	}
}
