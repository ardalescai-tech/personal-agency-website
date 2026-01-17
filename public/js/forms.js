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

    if (!payload.name || !payload.email || !payload.message || pages.length === 0) {
      showNotice(notice, 'Completeaza toate campurile obligatorii.', true);
      return;
    }

    try {
      await postJson('/api/quote', payload);
      form.reset();
      showNotice(notice, 'Cererea ta a fost trimisa. Revenim in curand cu oferta.', false);
    } catch (error) {
      showNotice(notice, error.message, true);
    }
  });
};

const initContactForm = () => {
  const form = document.querySelector('[data-form="contact"]');
  if (!form) return;

  const notice = document.querySelector('[data-notice="contact"]');

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
      await postJson('/api/contact', payload);
      form.reset();
      showNotice(notice, 'Mesajul a fost trimis. Multumesc!', false);
    } catch (error) {
      showNotice(notice, error.message, true);
    }
  });
};

initQuoteForm();
initContactForm();

