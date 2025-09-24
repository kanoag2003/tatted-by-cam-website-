export function scrollToSection(id: string ): void {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
