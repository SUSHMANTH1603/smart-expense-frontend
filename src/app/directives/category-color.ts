import { Directive, ElementRef, Renderer2, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appCategoryColor]',
  standalone: true
})
export class CategoryColorDirective implements OnInit {
  // 1. The Input: This grabs the category string from the HTML (e.g., "Food")
  @Input('appCategoryColor') category: string = '';

  // 2. Dependency Injection: 
  // ElementRef gives us the physical HTML tag.
  // Renderer2 is the secure engine we use to inject CSS into it.
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  // 3. Lifecycle Hook: Runs exactly once when the HTML element is painted
  ngOnInit() {
    let textColor = '#64748b'; // Default Gray
    let bgColor = '#f1f5f9';   // Default Light Gray

    // 4. The Color Palette Engine
    switch (this.category.toLowerCase()) {
      case 'food':
        textColor = '#15803d'; // Forest Green
        bgColor = '#dcfce7';   // Mint Green
        break;
      case 'transport':
      case 'travel':
        textColor = '#1d4ed8'; // Royal Blue
        bgColor = '#dbeafe';   // Ice Blue
        break;
      case 'entertainment':
      case 'netflix':
        textColor = '#7e22ce'; // Deep Purple
        bgColor = '#f3e8ff';   // Light Purple
        break;
      case 'shopping':
        textColor = '#be123c'; // Rose Red
        bgColor = '#ffe4e6';   // Light Pink
        break;
      case 'utilities':
      case 'bills':
        textColor = '#b45309'; // Amber/Orange
        bgColor = '#fef3c7';   // Light Yellow
        break;
    }

    // 5. Safely apply the CSS styles directly to the DOM element
    this.renderer.setStyle(this.el.nativeElement, 'color', textColor);
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', bgColor);
    this.renderer.setStyle(this.el.nativeElement, 'padding', '4px 12px');
    this.renderer.setStyle(this.el.nativeElement, 'borderRadius', '9999px'); // Makes it a pill shape
    this.renderer.setStyle(this.el.nativeElement, 'fontWeight', '600');
    this.renderer.setStyle(this.el.nativeElement, 'fontSize', '0.75rem');
    this.renderer.setStyle(this.el.nativeElement, 'display', 'inline-block');
    this.renderer.setStyle(this.el.nativeElement, 'textTransform', 'uppercase');
    this.renderer.setStyle(this.el.nativeElement, 'letterSpacing', '0.5px');
  }
}