# Alphadex — Design System & Screen Specifications
> **Version:** 1.0.0 · **Theme:** Light · **Platform:** React Native (Expo) + NativeWind v4 + TailwindCSS v3
> **Last updated:** 2026-07-11

---

## Table of Contents
1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography Scale](#3-typography-scale)
4. [Spacing & Layout Scale](#4-spacing--layout-scale)
5. [Elevation & Shadow Tokens](#5-elevation--shadow-tokens)
6. [Border Radius Tokens](#6-border-radius-tokens)
7. [Gradient Definitions](#7-gradient-definitions)
8. [Component Specifications](#8-component-specifications)
9. [Screen Layouts](#9-screen-layouts)
10. [Navigation — Floating Tab Bar](#10-navigation--floating-tab-bar)
11. [Tailwind Config Diff](#11-tailwind-config-diff)
12. [Animation & Micro-interaction Guide](#12-animation--micro-interaction-guide)
13. [Icon Usage Rules](#13-icon-usage-rules)

---

## 1. Brand Identity

| Token | Value |
|-------|-------|
| App name | **Alphadex** |
| Tagline | *Your personalized learning feed* |
| Brand feel | Energetic, student-first, trustworthy, premium-but-approachable |
| Visual signature | Orange→Red gradient on primary actions; clean white surfaces everywhere else |

**Logo treatment:** The wordmark "Alphadex" is set in Inter ExtraBold. The `α` (alpha) glyph is tinted with the `brand-gradient` (orange → red). All other letters remain `#1A1A1A` on light backgrounds.

---

## 2. Color System

### 2.1 Base Palette (raw hex tokens)

| Token name | Hex | Usage |
|-----------|-----|-------|
| `white` | `#FFFFFF` | Card surfaces, input backgrounds |
| `off-white` | `#FAFAFA` | App/page background |
| `gray-50` | `#F5F5F5` | Subtle section backgrounds |
| `gray-100` | `#E8E8E8` | Dividers, skeleton loaders |
| `gray-200` | `#D1D1D1` | Inactive borders |
| `gray-400` | `#9CA3AF` | Placeholder text |
| `gray-500` | `#6B7280` | Secondary / muted text |
| `gray-700` | `#374151` | Tertiary label text |
| `ink` | `#1A1A1A` | Primary text (headlines, body) |
| `orange-500` | `#FF6B35` | Brand orange — gradient start |
| `red-500` | `#F72C25` | Brand red — gradient end / destructive |
| `red-400` | `#FA5252` | Like / heart active tint |
| `green-500` | `#10B981` | Success, saved state — gradient start |
| `green-400` | `#34D399` | Success gradient end, following indicator |
| `blue-500` | `#3B82F6` | Info badges, links |
| `amber-400` | `#FBBF24` | Streak / star ratings |
| `surface` | `#FFFFFF` | Alias for white card surfaces |
| `bg` | `#FAFAFA` | Alias for app background |

### 2.2 Semantic Roles

| Semantic token | Resolves to | Notes |
|---------------|-------------|-------|
| `color.background` | `#FAFAFA` | Root screen background |
| `color.surface` | `#FFFFFF` | Cards, modals, sheets |
| `color.surface-elevated` | `#FFFFFF` + shadow-md | Floating cards |
| `color.text.primary` | `#1A1A1A` | Headlines & body |
| `color.text.secondary` | `#6B7280` | Captions, labels |
| `color.text.placeholder` | `#9CA3AF` | Input placeholder |
| `color.text.inverse` | `#FFFFFF` | Text on dark/gradient backgrounds |
| `color.border` | `#E8E8E8` | Default card/input border |
| `color.border-focus` | `#FF6B35` | Input focused ring |
| `color.accent.primary` | `#FF6B35` | Orange accent (use gradient, not flat) |
| `color.accent.danger` | `#F72C25` | Destructive / error |
| `color.accent.success` | `#10B981` | Positive / saved / following |
| `color.accent.info` | `#3B82F6` | Informational |

### 2.3 NativeWind / Tailwind class mapping

```
bg-[#FAFAFA]      → app background
bg-white           → card surface
text-[#1A1A1A]     → primary text
text-gray-500      → secondary text
border-[#E8E8E8]   → default border
text-[#FF6B35]     → orange accent text
```

> **Rule:** Prefer semantic Tailwind tokens over raw hex inline classes wherever possible.
> Reserve inline `text-[#hex]` only for one-off cases not covered by the palette.

---

## 3. Typography Scale

**Font family:** `Inter` (Google Fonts / expo-font).
Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
Line heights follow a 1.4–1.6× multiplier for body, tight 1.1–1.2× for headings.

| Step | Class | Size | Weight | Line-height | Usage |
|------|-------|------|--------|-------------|-------|
| `display` | `text-4xl font-extrabold` | 36sp | 800 | 42 | Landing hero, app name |
| `heading-1` | `text-3xl font-bold` | 30sp | 700 | 36 | Screen titles |
| `heading-2` | `text-2xl font-bold` | 24sp | 700 | 30 | Section headers |
| `heading-3` | `text-xl font-semibold` | 20sp | 600 | 26 | Card titles, modal heads |
| `title` | `text-lg font-semibold` | 18sp | 600 | 24 | Feed card title |
| `body-lg` | `text-base font-normal` | 16sp | 400 | 24 | Body copy, descriptions |
| `body` | `text-sm font-normal` | 14sp | 400 | 20 | Secondary copy, captions |
| `caption` | `text-xs font-normal` | 12sp | 400 | 16 | Timestamps, badge labels |
| `overline` | `text-xs font-semibold uppercase tracking-widest` | 11sp | 600 | 14 | Category labels, source badges |

---

## 4. Spacing & Layout Scale

Alphadex uses an **8px base grid**. All spacing values are multiples of 4px (matching TailwindCSS default scale).

| Token | px | Tailwind class | Usage |
|-------|----|----------------|-------|
| `space-1` | 4px | `p-1` / `gap-1` | Tight icon gaps |
| `space-2` | 8px | `p-2` / `gap-2` | Inner chip padding |
| `space-3` | 12px | `p-3` / `gap-3` | Compact card inner |
| `space-4` | 16px | `p-4` / `gap-4` | Standard card padding |
| `space-5` | 20px | `p-5` | Button vertical (large) |
| `space-6` | 24px | `px-6` | Screen horizontal margin |
| `space-8` | 32px | `mt-8` | Section separation |
| `space-10` | 40px | `mb-10` | Hero section gap |
| `space-12` | 48px | `pt-12` | Safe-area offset |

**Screen horizontal gutter:** `px-6` (24px) on all screens.
**Card inner padding:** `p-4` (16px) standard, `p-3` (12px) compact.
**List item gap:** `gap-3` (12px) between feed cards.

---

## 5. Elevation & Shadow Tokens

React Native shadows via `shadow-*` NativeWind utilities plus `elevation` for Android.

| Level | NativeWind classes | Android elevation | Use case |
|-------|-------------------|-------------------|----------|
| `shadow-none` | — | 0 | Flat chips, tags |
| `shadow-sm` | `shadow shadow-gray-200/60` | 2 | Default cards |
| `shadow-md` | `shadow-md shadow-gray-300/50` | 4 | Floating action cards, tab bar |
| `shadow-lg` | `shadow-lg shadow-gray-400/40` | 8 | Modals, bottom sheets |

---

## 6. Border Radius Tokens

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `radius-sm` | 8px | `rounded-lg` | Chips, small badges |
| `radius-md` | 12px | `rounded-xl` | Input fields |
| `radius-lg` | 16px | `rounded-2xl` | Cards, modals |
| `radius-xl` | 24px | `rounded-3xl` | Hero cards, large containers |
| `radius-full` | 9999px | `rounded-full` | Avatars, pill chips, FABs |

---

## 7. Gradient Definitions

> **Critical rule:** Gradients are **emphasis only**. Keep ≥80% of the UI white/neutral;
> apply gradients only to: primary CTA buttons, active tab indicators, progress bars,
> and accent borders on hero cards.

### 7.1 Primary Brand Gradient (orange → red)

```
Start:  #FF6B35  (orange-500)
End:    #F72C25  (red-500)
Direction: 135deg (bottom-left → top-right) on buttons
           90deg (left → right) on tab indicators / progress bars
```

**React Native implementation — expo-linear-gradient:**

```tsx
import { LinearGradient } from "expo-linear-gradient";

<LinearGradient
  colors={["#FF6B35", "#F72C25"]}
  start={{ x: 0, y: 1 }}
  end={{ x: 1, y: 0 }}
  style={{ borderRadius: 16 }}
>
  <Pressable className="py-4 px-8 items-center">
    <Text className="text-white font-semibold text-base">Get Started</Text>
  </Pressable>
</LinearGradient>
```

### 7.2 Success / Saved Gradient (green)

```
Start:  #10B981  (green-500)
End:    #34D399  (green-400)
Direction: 135deg
```

Used on: saved-state bookmark icon bg, "Following" chip, positive metric values.

### 7.3 Soft Card Accent Border

Featured feed cards carry a 2px top-border accent strip using the primary gradient.
Achieved by wrapping the card in a `LinearGradient` container with `padding: 2` and a white inner `View`.

```tsx
<LinearGradient
  colors={["#FF6B35", "#F72C25"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{ borderRadius: 16, padding: 2 }}
>
  <View className="bg-white rounded-2xl p-4">
    {/* card content */}
  </View>
</LinearGradient>
```

Apply only to **top-scored** feed cards (e.g. score > 0.8), not every card.

---

## 8. Component Specifications

### 8.1 GradientButton — Primary CTA

| Property | Value |
|----------|-------|
| Background | LinearGradient `#FF6B35 → #F72C25` |
| Border radius | `rounded-2xl` (16px) |
| Padding | `py-4 px-6` |
| Text | `text-white font-semibold text-base` |
| Width | `w-full` for form CTAs; `self-auto` for inline |
| Loading | `ActivityIndicator color="#FFFFFF"` |
| Pressed state | `scale(0.96)` via Reanimated `withSpring` |
| Disabled | `opacity-50`, gradient colors muted |

**Full implementation pattern:**

```tsx
// src/components/ui/GradientButton.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from "react-native-reanimated";

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export function GradientButton({ label, onPress, isLoading, disabled }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[animStyle, { borderRadius: 16 }]}>
      <LinearGradient
        colors={disabled ? ["#FFB899", "#FA9995"] : ["#FF6B35", "#F72C25"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 16 }}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled || isLoading}
          onPressIn={() => { scale.value = withSpring(0.96); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          className="py-4 items-center justify-center w-full"
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-semibold text-base">{label}</Text>}
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}
```

### 8.2 Button — Secondary (Ghost / Outline)

| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border | `border border-[#E8E8E8]` |
| Text | `text-[#1A1A1A] font-semibold text-base` |
| Border radius | `rounded-2xl` |
| Pressed | border shifts to `#FF6B35`, bg tints `#FFF5F0` |

### 8.3 TextField — Light Theme

| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border (default) | `border border-[#E8E8E8]` |
| Border (focus) | `border-[#FF6B35]` + soft glow ring |
| Label | `text-sm font-medium text-[#374151] mb-1.5` |
| Input text | `text-[#1A1A1A] text-base` |
| Placeholder color | `#9CA3AF` |
| Border radius | `rounded-xl` (12px) |
| Padding | `px-4 py-3.5` |
| Error state | `border-[#F72C25]`, `text-[#F72C25] text-xs mt-1` |
| Shadow | `shadow-sm shadow-gray-200/50` |

### 8.4 Chip — Filter Pill

| State | Classes |
|-------|---------|
| Default | `bg-[#F5F5F5] border border-[#E8E8E8] rounded-full px-4 py-2` |
| Active | `bg-[#FF6B35] border-[#FF6B35] rounded-full px-4 py-2` |
| Text default | `text-sm font-medium text-gray-700` |
| Text active | `text-sm font-medium text-white` |

Add `scale(1.04)` Reanimated spring on press for tactile feel.

### 8.5 ContentCard — Feed Card

```
┌─────────────────────────────────────────┐  rounded-2xl, shadow-sm, bg-white
│  [Thumbnail 16:9, rounded-t-2xl]        │
│─────────────────────────────────────────│
│  [SourceBadge]                          │  overline, gray-500
│                                         │
│  Card Title (max 2 lines)               │  title weight, #1A1A1A
│  Description excerpt (max 2 lines)      │  body-sm, gray-500
│                                         │
│  ─────────────────────────────────────  │  gray-100 divider
│  [♥ Like]    [🔖 Save]    [⏱ 5 min]   │  action row
└─────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | `bg-white rounded-2xl shadow-sm shadow-gray-200/60 overflow-hidden mb-3` |
| Thumbnail | `w-full h-44 bg-gray-100` resizeMode cover |
| Inner padding | `p-4` |
| Title | `text-base font-semibold text-[#1A1A1A] mt-1 mb-1` numberOfLines={2} |
| Description | `text-sm text-gray-500 mb-3` numberOfLines={2} |
| Action row | `flex-row items-center gap-5 pt-3 border-t border-[#F5F5F5]` |
| Like icon (inactive) | `Heart` size=18 color=`#9CA3AF` strokeWidth=1.5 |
| Like icon (active) | `Heart` size=18 color=`#FA5252` fill=`#FA5252` |
| Save icon (inactive) | `Bookmark` size=18 color=`#9CA3AF` strokeWidth=1.5 |
| Save icon (active) | `Bookmark` size=18 color=`#10B981` fill=`#10B981` |
| Read time | `Clock` size=14 color=`#9CA3AF`, `text-xs text-gray-400` |
| Featured card | 2px LinearGradient accent border (see §7.3), used for score > 0.8 |

### 8.6 SourceBadge

```tsx
// YouTube
<View className="flex-row items-center gap-1 bg-red-50 rounded-full px-2.5 py-1">
  <CirclePlay size={12} color="#EF4444" strokeWidth={1.5} />
  <Text className="text-xs font-semibold text-red-500 uppercase tracking-wide">
    YouTube
  </Text>
</View>

// Article / News
<View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1">
  <Newspaper size={12} color="#6B7280" strokeWidth={1.5} />
  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
    Article
  </Text>
</View>
```

### 8.7 StatCard — Admin Bento Grid

```
┌────────────────────────────┐
│  [Icon 40×40 rounded-xl]   │
│  3,240                     │  heading-2, #1A1A1A
│  Total Users               │  caption, gray-500
│  ↑ 12.4% from last week   │  caption, green-500 (positive) / red-500 (negative)
└────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | `bg-white rounded-2xl p-4 shadow-sm flex-1` |
| Icon container | `w-10 h-10 rounded-xl bg-[#FFF5F0] items-center justify-center mb-3` |
| Icon color | `#FF6B35` |
| Value | `text-2xl font-bold text-[#1A1A1A]` |
| Label | `text-xs text-gray-500 mt-0.5` |
| Delta positive | `text-xs text-[#10B981] font-medium mt-1` |
| Delta negative | `text-xs text-[#F72C25] font-medium mt-1` |

### 8.8 ChatBubble — AI Assistant

| Role | Style |
|------|-------|
| User | `bg-[#FF6B35] rounded-3xl rounded-br-sm px-4 py-3 max-w-[75%] self-end` + `text-white` |
| Assistant | `bg-white rounded-3xl rounded-bl-sm px-4 py-3 max-w-[80%] self-start shadow-sm` + `text-[#1A1A1A]` |
| Timestamp | `text-[10px] text-gray-400 mt-1` aligned to bubble side |
| Typing dots | Three animated dots, gray-400, staggered opacity loop |

### 8.9 Avatar

| Size | Classes | Use |
|------|---------|-----|
| xs | `w-7 h-7 rounded-full` | Compact lists |
| sm | `w-9 h-9 rounded-full` | Admin rows |
| md | `w-12 h-12 rounded-full` | Channel rows |
| lg | `w-16 h-16 rounded-full` | Profile header |
| xl | `w-24 h-24 rounded-full` | Full profile page |

Fallback (no image): `bg-[#FFF5F0]` container + initials `text-[#FF6B35] font-semibold`.

---

## 9. Screen Layouts

> **Shared shell:** `<SafeAreaView className="flex-1 bg-[#FAFAFA]">` as root.
> `headerShown: false` on all screens — each renders its own header row.

---

### 9.1 Landing / Onboarding

**File:** `app/(auth)/landing.tsx`

```
┌─────────────────────────────┐
│                             │
│  ┌───────────────────────┐  │  60% screen height
│  │                       │  │
│  │   Hero illustration   │  │  Gradient blob bg (orange-red top-right,
│  │   with branded blobs  │  │  green bottom-left), floating subject img
│  │                       │  │
│  │   α Alphadex          │  │  wordmark overlay bottom-left
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │  Bottom sheet: bg-white rounded-t-3xl p-8
│  │ Your personalized     │  │  heading-2 bold
│  │ learning feed         │  │
│  │                       │  │
│  │ Curated from channels │  │  body-lg gray-500
│  │ and topics you care   │  │
│  │ about.                │  │
│  │                       │  │
│  │ [▶  Get Started    ]  │  │  GradientButton full-width
│  │ [   Sign In        ]  │  │  SecondaryButton full-width mt-3
│  │                       │  │
│  │    ●  ○  ○            │  │  page dots (orange active)
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Onboarding panels (optional 3-step swipe):**
1. *Smart Feed* — `Sparkles` icon — "Personalized content ranked for how you learn"
2. *All your sources* — `Layers` icon — "YouTube, articles, podcasts — one scroll"
3. *Stay ahead* — `TrendingUp` icon — "Daily briefings for your subjects"

Each panel: 64×64 `bg-[#FFF5F0] rounded-3xl` icon container, heading-2, body, animated dot indicator.

---

### 9.2 Login

**File:** `app/(auth)/login.tsx`

```
┌─────────────────────────────┐
│  [← Back]          α logo  │  header row h-14
│                             │
│  Welcome back 👋            │  heading-1, mt-8
│                             │
│  [Email              ]      │  TextField (light theme)
│  [Password           ]      │  TextField with show/hide toggle
│                             │
│                  Forgot?    │  right-aligned text-[#FF6B35] text-sm
│                             │
│  [    Sign In         ]     │  GradientButton mt-6
│                             │
│  ─────── or ─────────       │  divider
│                             │
│  [G  Continue w/ Google]    │  SecondaryButton + Google icon
│                             │
│  Don't have an account?     │
│  Sign up →                  │  text-[#FF6B35] font-semibold
│                             │
└─────────────────────────────┘
```

**Error banner (above button):**
```
bg-red-50 border border-[#F72C25]/30 rounded-xl p-3
Text: text-sm text-[#F72C25] font-medium
```

---

### 9.3 Register

**File:** `app/(auth)/register.tsx`

```
┌─────────────────────────────┐
│  [← Back]                   │
│                             │
│  Create account             │  heading-1
│                             │
│  [Full Name          ]      │  TextField
│  [Email              ]      │
│  [Password           ] [👁] │  show/hide toggle right
│  [Confirm Password   ]      │
│                             │
│  ████░░░░ Medium            │  password strength bar (4 segments)
│                             │
│  [    Sign Up         ]     │  GradientButton
│                             │
│  Already have an account?   │
│  Sign in →                  │
└─────────────────────────────┘
```

**Password strength bar segments:**

```tsx
// 4 segments, fills left-to-right with gradient color
<View className="flex-row gap-1 mt-2 mb-4">
  {[1, 2, 3, 4].map(i => (
    <View
      key={i}
      className={`flex-1 h-1.5 rounded-full ${
        i <= strength ? "bg-[#FF6B35]" : "bg-[#E8E8E8]"
      }`}
    />
  ))}
</View>
// strength label: "Weak" (red) | "Fair" (orange) | "Good" (amber) | "Strong" (green)
```

---

### 9.4 Interests Picker

**File:** `app/(auth)/interests.tsx`

```
┌─────────────────────────────┐
│  Step 3 of 3                │  caption gray-500
│  ████████░░ 66%             │  LinearGradient progress bar h-1.5
│                             │
│  What are you into? 🎓      │  heading-2
│  Select at least 3 topics   │  body gray-500
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ │  chip wrap flex-row flex-wrap gap-2 px-6
│  │ Math │ │ Sci  │ │ Hist │ │
│  └──────┘ └──────┘ └──────┘ │
│  ┌────────┐ ┌──────┐        │
│  │  Code  │ │  Art │  ...   │
│  └────────┘ └──────┘        │
│  (15–20 chips total)        │
│                             │
│  3 selected                 │  caption text-[#FF6B35]
│                             │
│  [   Continue →    ]        │  GradientButton, disabled until ≥3 selected
└─────────────────────────────┘
```

Active chip: orange-filled with white text.
Each chip includes a Lucide icon (size 14, `mr-1`): e.g. `Calculator`, `FlaskConical`, `Code2`, `Palette`, `Globe`, `BookOpen`.

---

### 9.5 Feed

**File:** `app/(tabs)/feed.tsx`

```
┌─────────────────────────────┐  bg-[#FAFAFA]
│  Hey, Sophia 👋             │  heading-2, px-6 pt-4
│  4 new items today          │  caption gray-500
│                             │
│  ┌─────────────────────┐    │  horizontal ScrollView, mb-4, px-6
│  │All│ Tech │Math │...│    │  filter chip row
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │  FEATURED — LinearGradient accent border
│  │ [Thumbnail]         │    │  (score > 0.8 items only)
│  │ SourceBadge         │    │
│  │ Title               │    │
│  └─────────────────────┘    │
│                             │
│  [Standard ContentCard]     │
│  [Standard ContentCard]     │
│  [Standard ContentCard]     │
│  ...                        │
│                             │
│  ─── That's all for now ─── │  end-of-feed divider + caption
└─────────────────────────────┘
```

**Loading skeleton:** 4 placeholder cards, bg `#E8E8E8` shimmer animation.

**Empty state:**
```
centered, py-20
Inbox icon, size=48, color=#E8E8E8
"Nothing here yet"       heading-3
"Follow channels or pick interests"   body gray-500
[Explore Topics]         GradientButton w-48 self-center mt-4
```

---

### 9.6 AI Assistant Chat

**File:** `app/(tabs)/assistant.tsx`

```
┌─────────────────────────────┐
│  ←  │  AI Assistant  │  ⋮  │  header h-14 bg-white shadow-sm
│─────────────────────────────│
│                             │  KeyboardAvoidingView flex-1
│  ┌────────────────────────┐ │  assistant bubble (left)
│  │  Hello! I'm Alphadex   │ │
│  │  AI. Ask me anything   │ │
│  │  about your topics. 🎓 │ │
│  └────────────────────────┘ │
│                             │
│        ┌──────────────────┐ │  user bubble (right, gradient orange)
│        │ What's new in    │ │
│        │ machine learning?│ │
│        └──────────────────┘ │
│        12:04 PM             │  timestamp
│                             │
│  ┌────────────────────────┐ │  assistant bubble
│  │  Great question! Here  │ │
│  │  are the top 3         │ │
│  │  breakthroughs...      │ │
│  └────────────────────────┘ │
│                             │
│  [ ● ● ● ]  typing         │  animated dots
│─────────────────────────────│
│  [📎] [  Type a message  ][▶]│  input bar
└─────────────────────────────┘
```

**Input bar:**
- Container: `bg-white border-t border-[#F5F5F5] px-4 py-3 flex-row items-center gap-3`
- Field: `flex-1 bg-[#F5F5F5] rounded-full px-4 py-2.5 text-sm text-[#1A1A1A]`
- Send btn: `w-10 h-10 rounded-full` LinearGradient (orange→red) + `SendHorizontal` white icon size=18
- Attach btn: `w-9 h-9 rounded-full bg-[#F5F5F5]` + `Paperclip` gray-500 size=18

**Suggested prompts (empty state):**
Horizontal ScrollView of pill chips: `bg-[#FFF5F0] border border-[#FF6B35]/30 rounded-full px-4 py-2`, `text-sm text-[#FF6B35] font-medium`.
Examples: "Summarize today's feed" | "Explain quantum computing" | "Quiz me on history"

---

### 9.7 Search

**File:** `app/(tabs)/search.tsx`

```
┌─────────────────────────────┐
│  Search                     │  heading-1, px-6 pt-4
│                             │
│  [🔍  Search topics...   ]  │  SearchField: bg-white rounded-2xl shadow-sm px-4 py-3.5
│                             │
│  Trending Topics            │  heading-3, mt-6
│  ┌─────┐ ┌──────┐ ┌──────┐ │  chip row, px-6
│  │ AI  │ │ Math │ │Space │ │
│  └─────┘ └──────┘ └──────┘ │
│                             │
│  Popular Channels           │  heading-3, mt-6
│  ┌──────────────────────┐   │
│  │ [Av] 3Blue1Brown  [+]│   │  ChannelRow
│  │ [Av] Veritasium   [+]│   │
│  │ [Av] MIT News     [+]│   │
│  └──────────────────────┘   │
│                             │
│  [Search results here]      │  FlashList ContentCard, query ≥ 2 chars
└─────────────────────────────┘
```

**SearchField:**
- `Search` icon size=18 color=`#9CA3AF` absolute left, `pl-11`
- `X` clear icon appears when text.length > 0, right side
- Focus: `border-[#FF6B35]`

**ChannelRow:**
- Avatar 40px + name `text-base font-semibold` + subscriber count `text-xs gray-500`
- Follow chip: `border border-[#FF6B35] rounded-full px-3 py-1 text-[#FF6B35] text-xs font-semibold`
- Following chip: LinearGradient green bg, white text, `CheckCircle` icon size=12

---

### 9.8 Profile

**File:** `app/(tabs)/profile.tsx`

```
┌─────────────────────────────┐
│                    ⚙️  🔔  │  icon row right-aligned, h-14
│─────────────────────────────│
│                             │
│       [Avatar XL 96px]      │  centered, border-2 border-[#FF6B35]
│       Sophia Nguyen         │  heading-2 mt-3
│       sophia@email.com      │  body gray-500
│                             │
│  ┌──────────┬────────┬────┐ │  stats row
│  │   120    │   48   │ 12 │ │
│  │  Saved   │ Liked  │Days│ │
│  └──────────┴────────┴────┘ │
│                             │
│  ─────────────────────────  │
│  My Topics                  │  heading-3
│  [Chip] [Chip] [Chip]       │  green active chips
│                             │
│  ─────────────────────────  │
│  Saved Content     View All │  heading-3 + link
│  [ContentCard mini]         │
│  [ContentCard mini]         │
│                             │
│  ─────────────────────────  │
│  [  Sign Out  ]             │  SecondaryButton, text/border red-500
└─────────────────────────────┘
```

**Stat column spec:**

```tsx
<View className="flex-1 items-center py-3 border-r border-[#F5F5F5]">
  <Text className="text-2xl font-bold text-[#1A1A1A]">120</Text>
  <Text className="text-xs text-gray-500 mt-0.5">Saved</Text>
</View>
```

---

### 9.9 Admin Dashboard

**File:** `app/(tabs)/admin.tsx`

```
┌─────────────────────────────┐
│  Admin Dashboard  ● Live    │  heading-2 + green pulse dot
│─────────────────────────────│
│  ScrollView                 │
│                             │
│  ┌───────────┬───────────┐  │  BENTO ROW 1 — flex-row gap-3
│  │ 👥 Users  │ 📰 Items  │  │  2 × StatCard (flex-1)
│  │   3,240   │  18,420   │  │
│  │ ↑ 12.4%   │ ↑ 8.1%   │  │
│  └───────────┴───────────┘  │
│                             │
│  ┌──────────────────────────┐│  BENTO ROW 2 — full-width
│  │ Feed Engagement          ││  Chart card (placeholder → Phase 3)
│  │ [Bar chart placeholder]  ││
│  └──────────────────────────┘│
│                             │
│  ┌────────┬───────┬────────┐ │  BENTO ROW 3 — flex-row gap-3
│  │ Likes  │ Saves │ Shares │ │  3 × StatCard (flex-1)
│  │  9,821 │ 4,130 │   892  │ │
│  └────────┴───────┴────────┘ │
│                             │
│  Top Content                │  heading-3 mt-4
│  ┌──────────────────────────┐│
│  │ 1. [Title...]   ♥ 821   ││  compact ranked list
│  │ 2. [Title...]   ♥ 712   ││
│  │ 3. [Title...]   ♥ 698   ││
│  └──────────────────────────┘│
│                             │
│  Recent Signups             │  heading-3 mt-4
│  [User avatar · email · time]│
│  [User avatar · email · time]│
└─────────────────────────────┘
```

**Live indicator:**

```tsx
<View className="flex-row items-center gap-1.5">
  {/* green pulse dot — use Reanimated repeat opacity */}
  <View className="w-2 h-2 rounded-full bg-[#10B981]" />
  <Text className="text-xs font-semibold text-[#10B981]">Live</Text>
</View>
```

**Bento grid rules:**
- Row 1: 2 × 50% `StatCard` — primary KPIs (Users, Total Items)
- Row 2: 1 × 100% — chart / activity card
- Row 3: 3 × `flex-1` `StatCard` — secondary metrics (Likes, Saves, Shares)
- Gap: `gap-3` between all cells
- All cells: `bg-white rounded-2xl shadow-sm p-4`

---

## 10. Navigation — Floating Tab Bar

The standard Expo bottom tab bar is replaced with a floating glass-effect pill bar.

```
   ╔════════════════════════════════════╗
   ║  🏠 Home  🔍 Search  ✦ AI  👤 Me  ║
   ╚════════════════════════════════════╝
        mx-6 mb-6, floating above content
```

| Property | Value |
|----------|-------|
| Background | `rgba(255,255,255,0.85)` + `BlurView` (expo-blur) |
| Border | `border border-[#E8E8E8]` |
| Border radius | `rounded-3xl` |
| Margin | `mx-6 mb-6` |
| Shadow | `shadow-lg shadow-gray-400/30` |
| Active icon tint | `#FF6B35` |
| Inactive icon tint | `#9CA3AF` |
| Active label | `text-xs font-semibold text-[#FF6B35]` |
| Inactive label | `text-xs text-gray-400` |
| Active indicator | 3px dot below icon, LinearGradient (orange→red) |
| AI center tab | Slightly larger `Sparkles` icon (size=24), LinearGradient pill bg |

**Implementation:** Use Expo Router `<Tabs>` with `tabBar` prop rendering a custom `BlurView` component.

---

## 11. Tailwind Config Diff

Replace the existing `tailwind.config.js` with the light-theme palette:

```diff
  module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          primary: {
-           DEFAULT: "#4F46E5",
-           light: "#818CF8",
-           dark: "#3730A3",
+           DEFAULT: "#FF6B35",
+           light:   "#FF8F5E",
+           dark:    "#E55A24",
          },
-         surface: "#0F172A",
+         surface: "#FFFFFF",
          muted: "#64748B",
+
+         // App background
+         bg: "#FAFAFA",
+
+         // Primary text
+         ink: "#1A1A1A",
+
+         // Brand gradient endpoints
+         brand: {
+           orange: "#FF6B35",
+           red:    "#F72C25",
+           "green-start": "#10B981",
+           "green-end":   "#34D399",
+         },
        },
      },
    },
    plugins: [],
  };
```

> **⚠️ Breaking change:** After this change, `bg-surface` becomes white (was dark `#0F172A`).
> You must audit every existing screen and component:
>
> | Old class | New class |
> |-----------|-----------|
> | `bg-surface` | `bg-[#FAFAFA]` (screen) or `bg-white` (card) |
> | `text-white` | `text-[#1A1A1A]` or `text-ink` |
> | `bg-slate-800` | `bg-white` |
> | `text-slate-300/400/500` | `text-gray-500` or `text-gray-700` |
> | `border-slate-700` | `border-[#E8E8E8]` |
> | `bg-primary` (flat) | `<GradientButton>` or `<LinearGradient colors={…}>` |
>
> Files to update: `Button.tsx`, `TextField.tsx`, `ContentCard.tsx`, all auth screens, all tab screens.

---

## 12. Animation & Micro-interaction Guide

All animations use **react-native-reanimated v4** (`useAnimatedStyle`, `withSpring`, `withTiming`).

| Interaction | Animation | Config |
|-------------|-----------|--------|
| Button press-in | `scale: 1 → 0.96` | `withSpring({ damping: 15, stiffness: 300 })` |
| Button press-out | `scale: 0.96 → 1.0` | `withSpring({ damping: 12, stiffness: 200 })` |
| Chip select | `scale: 1 → 1.05 → 1` | spring, + bg color `withTiming(150)` |
| Card press | `scale: 1 → 0.98` + shadow reduce | `withTiming(150)` |
| Screen mount | `opacity: 0 → 1` + `translateY: 16 → 0` | `withTiming(300, easeOut)` |
| Tab icon switch | `scale: 0.8 → 1.0` + color crossfade | spring |
| Skeleton shimmer | `translateX: -width → +width` looping | `withRepeat(withTiming(800))` |
| AI typing dots | `opacity: 0.3 → 1.0` staggered, 3 dots | `withDelay(i*150, withRepeat(…))` |
| Like heart | `scale: 1 → 1.3 → 1` + color fill | spring |
| Live dot | `opacity: 1 → 0.3` repeat | `withRepeat(withTiming(800))` |

---

## 13. Icon Usage Rules

Library: **lucide-react-native** (already installed, v1.24+).

| Rule | Value |
|------|-------|
| Stroke width | **1.5** for all icons (override default 2) |
| Inactive color | `#9CA3AF` (gray-400) |
| Active color | `#FF6B35` (orange) or context-specific (red for like, green for save) |
| Active fill | Only on Heart/Bookmark when toggled; use `fill` prop |

**Size scale:**

| Size | Usage |
|------|-------|
| 12 | Badge icons inside SourceBadge |
| 14 | Caption-level icon+text combos |
| 18 | Action row icons (Like, Save, Clock) |
| 20 | Navigation / header icons |
| 24 | Hero nav icons (AI tab), empty-state illustration |
| 48 | Empty state large decorative icons |

**Icon map by screen:**

| Screen | Icons |
|--------|-------|
| Landing | `Sparkles`, `Layers`, `TrendingUp` |
| Auth | `Mail`, `Lock`, `Eye`, `EyeOff`, `User`, `ArrowLeft` |
| Feed | `CirclePlay`, `Newspaper`, `Heart`, `Bookmark`, `Clock`, `Inbox` |
| AI Chat | `SendHorizontal`, `Paperclip`, `Sparkles`, `Bot`, `MoreVertical` |
| Search | `Search`, `X`, `CheckCircle` |
| Profile | `Settings`, `Bell`, `LogOut` |
| Admin | `Users`, `FileText`, `Heart`, `Bookmark`, `Share2`, `TrendingUp`, `BarChart3` |
| Nav bar | `Home`, `Search`, `Sparkles`, `User`, `Shield` |
| Empty states | `Inbox`, `SearchX`, `WifiOff` (size 48, color `#E8E8E8`) |

---

*End of DESIGN.md — Alphadex v1.0.0*
