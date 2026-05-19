import { Stack } from 'expo-router';

export default function OutilsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="kua" />
      <Stack.Screen name="boussole" />
      <Stack.Screen name="logement" />
      <Stack.Screen name="temporel" />
    </Stack>
  );
}
