// Any "Contact us" button opens the contact dialog through this event.
export const CONTACT_EVENT = 'clearline:contact'
export const openContact = () => window.dispatchEvent(new Event(CONTACT_EVENT))
