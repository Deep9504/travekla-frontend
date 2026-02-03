export const themeConfig = {
    token: {
        // Primary Color: Charcoal/Slate Blue (Professional, Trustworthy)
        colorPrimary: '#2c3e50',
        // Link Color
        colorLink: '#2c3e50',
        colorLinkHover: '#c5a059', // Muted Gold on hover

        // Typography
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontSize: 14,

        // Layout
        borderRadius: 8,
        colorBgLayout: '#f8f9fa', // Clean off-white background
        colorTextHeading: '#2c3e50',
    },
    components: {
        Button: {
            borderRadius: 6,
            controlHeight: 40,
            fontWeight: 500,
            primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
        },
        Card: {
            borderRadius: 12,
            boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        },
        Input: {
            borderRadius: 6,
            controlHeight: 40,
        },
        Layout: {
            headerBg: '#ffffff',
            bodyBg: '#f8f9fa',
            footerBg: '#f0f2f5',
        },
        Menu: {
            activeBarBorderWidth: 0,
            itemSelectedColor: '#c5a059', // Gold for selected item
            itemHoverColor: '#c5a059',    // Gold for hover
        }
    }
};
