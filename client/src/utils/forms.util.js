export const showFieldError = (input, message, errorElement = null) => {
  input.classList.remove("border-blue-100", "focus:border-blue-400");
  input.classList.add("border-red-500", "focus:border-red-500");

  const msg = errorElement;
  if (msg) {
    msg.textContent = message;
    msg.classList.remove("hidden");
  }
};
export const clearFieldError = (input, errorElement = null) => {
  input.classList.remove("border-red-500", "focus:border-red-500");
  input.classList.add("border-blue-100", "focus:border-blue-400");

  const msg = errorElement;
  if (msg) {
    msg.textContent = "";
    msg.classList.add("hidden");
  }
};

export const validateSync = (input, errorElement, rules) => {
  const inputValue = input.value.trim();
  for (const rule of rules) {
    if (rule.validate(inputValue)) {
      showFieldError(input, rule.errorMessage, errorElement);
      return false; // has error
    }
  }
  clearFieldError(input, errorElement);
  return true; // no error
};

export const setButtonLoadingState = (button, isLoading, loadingText = "Guardando...", originalText = "Guardar") => {
  if (!button) return
  button.disabled = isLoading
  button.textContent = isLoading ? loadingText : originalText
  if (isLoading) {
    button.classList.add("opacity-75", "cursor-wait")
  } else {
    button.classList.remove("opacity-75", "cursor-wait")
  }
};

export const createDebouncedValidator = (input, errorElement, rules, delay = 500) => {
  let timeoutId;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const inputValue = input.value.trim();
      let error = null;
      for (const rule of rules) {
        if (rule.validate(inputValue)) {
          error = rule.errorMessage;
          break;
        }
      }
      if (error) {
        showFieldError(input, error, errorElement);
      } else {
        clearFieldError(input, errorElement);
      }
    }, delay);
  };
};
