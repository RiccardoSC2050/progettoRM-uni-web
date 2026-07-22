export function field(form, name) {
  return form.elements[name] || null;
}

export function valueOf(form, name) {
  return field(form, name)?.value?.trim() || "";
}

export function messageBox(form) {
  return form.querySelector("[data-sim-form-message]");
}

export function setInvalid(form, names) {
  Array.from(form.elements).forEach((element) => {
    element.classList?.remove("is-invalid");
  });

  names.forEach((name) => {
    field(form, name)?.classList?.add("is-invalid");
  });
}

export function setFieldVisibility(wrapper, visible) {
  if (!wrapper) {
    return;
  }

  wrapper.hidden = !visible;
  wrapper.querySelectorAll("input, select").forEach((element) => {
    if (!visible) {
      element.disabled = true;
      return;
    }

    if (element.dataset.simLocked === "true") {
      element.disabled = true;
      return;
    }

    element.disabled = false;
  });
}
