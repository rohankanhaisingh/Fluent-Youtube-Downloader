import { allComponents, provideFluentDesignSystem, Palette } from "@fluentui/web-components";
import { PartialTheme, ThemeProvider, createTheme } from "@fluentui/react";
import { initializeIcons } from "@fluentui/font-icons-mdl2";

initializeIcons();

const designSystem = provideFluentDesignSystem();

designSystem.register({
    accent: '#0078D4',
    neutralDark: '#201F1E',
    neutralLighter: '#E1DFDD',
    neutralLight: '#EDEBE9',
    neutralQuaternaryAlt: '#D0D0D0',
    neutralQuaternary: '#D8D8D8',
    neutralTertiaryAlt: '#C8C6C4',
    neutralTertiary: '#A19F9D',
    neutralSecondary: '#605E5C',
    neutralPrimaryAlt: '#3B3A39',
    neutralPrimary: '#323130',
    themeDark: '#005A9E',
    themeDarkAlt: '#106EBE',
    themeDarker: '#004578',
    themeLight: '#C7E0F4',
    themeLighter: '#DEECF9',
    themeLighterAlt: '#EFF6FC',
    themePrimary: '#0078D4',
    themeSecondary: '#2B88D8',
    themeTertiary: '#71AFE5',
});


designSystem.register(allComponents);