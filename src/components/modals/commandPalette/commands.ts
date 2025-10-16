import type { FocusMode } from '../../../types';
import type { Command, CommandCategory } from './types';
import { getActions } from '../../../global';

export function getAvailableCommands(focusMode?: FocusMode): CommandCategory[] {
  const { setFocusMode } = getActions();

  const focusModeCommands: Command[] = [];

  if (!focusMode) {
    focusModeCommands.push({
      id: 'enable-focus-no-distraction',
      title: 'Enable Focus Mode: No Distraction',
      subtitle: 'Minimize distractions and stay focused',
      icon: 'eye-crossed',
      keywords: ['focus', 'enable', 'no distraction', 'distraction'],
      action: () => {
        setFocusMode({ mode: 'noDistraction' });
      },
    });

    focusModeCommands.push({
      id: 'enable-focus-deep-work',
      title: 'Enable Focus Mode: Deep Work',
      subtitle: 'Enter deep work mode for maximum productivity',
      icon: 'mute',
      keywords: ['focus', 'enable', 'deep work', 'work', 'productivity'],
      action: () => {
        setFocusMode({ mode: 'deepWork' });
      },
    });
  } else {
    focusModeCommands.push({
      id: 'disable-focus-mode',
      title: 'Disable Focus Mode',
      subtitle: `Currently: ${focusMode === 'noDistraction' ? 'No Distraction' : 'Deep Work'}`,
      icon: 'unmute',
      keywords: ['focus', 'disable', 'turn off', 'exit'],
      action: () => {
        setFocusMode({ mode: undefined });
      },
    });

    const otherMode = focusMode === 'noDistraction' ? 'deepWork' : 'noDistraction';
    const otherModeTitle = otherMode === 'noDistraction' ? 'No Distraction' : 'Deep Work';

    focusModeCommands.push({
      id: `switch-focus-${otherMode}`,
      title: `Switch to ${otherModeTitle}`,
      subtitle: `Currently: ${focusMode === 'noDistraction' ? 'No Distraction' : 'Deep Work'}`,
      icon: 'replace',
      keywords: ['focus', 'switch', otherModeTitle.toLowerCase()],
      action: () => {
        setFocusMode({ mode: otherMode });
      },
    });
  }

  const categories: CommandCategory[] = [];

  if (focusModeCommands.length > 0) {
    categories.push({
      id: 'focus-mode',
      title: 'Focus Mode',
      commands: focusModeCommands,
    });
  }

  return categories;
}

export function searchCommands(
  categories: CommandCategory[],
  query: string,
): Command[] {
  if (!query) {
    return categories.flatMap((category) => category.commands);
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: Command[] = [];

  categories.forEach((category) => {
    category.commands.forEach((command) => {
      const titleMatch = command.title.toLowerCase().includes(lowerQuery);
      const subtitleMatch = command.subtitle?.toLowerCase().includes(lowerQuery);
      const keywordsMatch = command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(lowerQuery),
      );

      if (titleMatch || subtitleMatch || keywordsMatch) {
        results.push(command);
      }
    });
  });

  return results;
}

