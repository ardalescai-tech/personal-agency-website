const showNotice = (container, message, isError = false) => {
  container.textContent = message;
  container.classList.toggle('error', isError);
  container.classList.add('notice');
};

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.error || 'Eroare la trimitere.';
    throw new Error(message);
  }

  return response.json();
};

const initQuoteForm = () => {
  const form = document.querySelector('[data-form="quote"]');
  if (!form) return;

  const notice = document.querySelector('[data-notice="quote"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const initialText = submitButton ? submitButton.textContent : '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const pages = Array.from(form.querySelectorAll('input[name="pages"]:checked')).map(
      (input) => input.value
    );
    const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map(
      (input) => input.value
    );

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      business_type: form.business_type.value.trim(),
      website_type: form.website_type.value.trim(),
      pages,
      features,
      design_preferences: form.design_preferences.value.trim(),
      budget_range: form.budget_range.value.trim(),
      deadline: form.deadline.value.trim(),
      message: form.message.value.trim(),
    };

    if (!payload.name || !payload.email) {
      showNotice(notice, 'Completeaza toate campurile obligatorii.', true);
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Se trimite...';
      }
      await postJson('/api/quote', payload);
      form.reset();
      showNotice(notice, 'Cererea ta a fost trimisa. Revenim in curand cu oferta.', false);
    } catch (error) {
      showNotice(notice, error.message, true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = initialText;
      }
    }
  });
};

const initContactForm = () => {
  const form = document.querySelector('[data-form="contact"]');
  if (!form) return;

  const notice = document.querySelector('[data-notice="contact"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const initialText = submitButton ? submitButton.textContent : '';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      showNotice(notice, 'Completeaza toate campurile obligatorii.', true);
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Se trimite...';
      }
      await postJson('/api/contact', payload);
      form.reset();
      showNotice(notice, 'Mesajul a fost trimis. Multumesc!', false);
    } catch (error) {
      showNotice(notice, error.message, true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = initialText;
      }
    }
  });
};

initQuoteForm();
initContactForm();

