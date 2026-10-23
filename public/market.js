const filterPanel = document.querySelector('.filter-panel');
if (filterPanel) {
    const mobile = window.matchMedia('(max-width: 760px)');
    const syncFilters = () => { filterPanel.open = !mobile.matches; };
    syncFilters();
    mobile.addEventListener('change', syncFilters);
}


const reservationForm = document.querySelector('.reservation-form');
if (reservationForm) {
    const quantity = reservationForm.querySelector('[name="quantity"]');
    const total = reservationForm.querySelector('#reservationTotal');
    const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
    const updateTotal = () => {
        const units = Number(quantity.value);
        total.textContent = quantity.validity.valid && Number.isInteger(units)
            ? money.format(Number(reservationForm.dataset.priceCentavos) * units / 100)
            : 'Check quantity';
    };
    quantity.addEventListener('input', updateTotal);
    updateTotal();
}
document.querySelectorAll('form[method="post"]').forEach(form => {
    form.addEventListener('submit', event => {
        if (form.dataset.submitting === 'true') { event.preventDefault(); return; }
        form.dataset.submitting = 'true';
        form.querySelectorAll('button:not([type="button"])').forEach(button => {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        });
    });
});
window.addEventListener('pageshow', () => {
    document.querySelectorAll('form[data-submitting]').forEach(form => {
        delete form.dataset.submitting;
        form.querySelectorAll('button[aria-busy="true"]').forEach(button => {
            button.disabled = false;
            button.removeAttribute('aria-busy');
        });
    });
});
