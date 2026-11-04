// Site-wide settings (replaces the Jekyll _config.yml).

export const SITE = {
  firstName: 'Michael',
  lastName: 'Thomas',
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  description:
    'Michael Thomas: senior software engineer specializing in back-end systems, scalable architectures, and legacy modernization.',
  lang: 'en',
  email: 'mdiegothomas@gmail.com',
  resumePdf: '/assets/pdf/resume.pdf',
};

export const BLOG = {
  name: 'sidetracked',
  description: 'I just need to look something up real quick...',
  pageSize: 5,
  latestPostsOnHome: 5,
};

export const SOCIAL = {
  github: 'billythemoose',
  linkedin: 'michael-thomas-sde',
};

export interface NavItem {
  title: string;
  href: string;
}

export const NAV: NavItem[] = [
  { title: 'about', href: '/' },
  { title: 'blog', href: '/blog/' },
  { title: 'projects', href: '/projects/' },
  { title: 'cv', href: '/cv/' },
];
