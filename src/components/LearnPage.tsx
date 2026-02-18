import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Sun, Moon, FlaskConical, GraduationCap } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { navigate } from '../lib/router';
import type { Route } from '../lib/router';
import type { LearnManifest, LearnCourse, LearnArticle } from '../types/learn';
import type { Catalogue } from '../types/catalogue';

interface LearnPageProps {
  route: Route & { page: 'learn' };
}

export function LearnPage({ route }: LearnPageProps) {
  const { darkMode, toggleDarkMode } = useAppStore();
  const [manifest, setManifest] = useState<LearnManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Scroll to top when navigating
  useEffect(() => {
    pageRef.current?.scrollTo(0, 0);
  }, [route.courseSlug, route.articleSlug]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}learn.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json() as Promise<LearnManifest>;
      })
      .then(setManifest)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className={`learn-page ${darkMode ? '' : 'light-theme'}`}>
        <div className="learn-error">Failed to load learning content: {error}</div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className={`learn-page ${darkMode ? '' : 'light-theme'}`}>
        <div className="learn-loading">Loading…</div>
      </div>
    );
  }

  const course = route.courseSlug
    ? manifest.courses.find((c) => c.slug === route.courseSlug)
    : null;

  const article = course && route.articleSlug
    ? course.articles.find((a) => a.slug === route.articleSlug)
    : null;

  // Determine back button behavior
  let backLabel: string;
  let backAction: () => void;
  if (article && course) {
    backLabel = course.title;
    backAction = () => navigate({ page: 'learn', courseSlug: course.slug });
  } else if (course) {
    backLabel = 'All courses';
    backAction = () => navigate({ page: 'learn' });
  } else {
    backLabel = 'Playground';
    backAction = () => navigate({ page: 'home' });
  }

  return (
    <div ref={pageRef} className={`learn-page ${darkMode ? '' : 'light-theme'}`}>
      <header className="learn-header">
        <button
          className="learn-back-btn"
          onClick={backAction}
          title={`Back to ${backLabel}`}
        >
          <ArrowLeft size={20} />
          <span>{backLabel}</span>
        </button>
        <div className="learn-header-title">
          <BookOpen size={20} />
          <span>Learn</span>
        </div>
        <button className="icon-btn" onClick={toggleDarkMode} title="Toggle Theme">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {article && course ? (
        <ArticleView article={article} course={course} darkMode={darkMode} />
      ) : course ? (
        <CourseDetail course={course} />
      ) : (
        <CourseCatalogue courses={manifest.courses} />
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// Course Catalogue (top-level index)
// -------------------------------------------------------------------

function CourseCatalogue({ courses }: { courses: LearnCourse[] }) {
  return (
    <div className="learn-index">
      <div className="learn-index-hero">
        <h1>Learn</h1>
        <p>
          Learning paths and hands-on labs to help you understand and build
          ontologies for Microsoft Fabric IQ.
        </p>
      </div>
      <div className="learn-card-grid">
        {courses.map((c) => (
          <button
            key={c.slug}
            className="learn-card"
            onClick={() => navigate({ page: 'learn', courseSlug: c.slug })}
          >
            <div className="learn-card-header">
              <span className="learn-card-icon">{c.icon}</span>
              <span className={`learn-card-badge learn-card-badge--${c.type}`}>
                {c.type === 'lab' ? <FlaskConical size={12} /> : <GraduationCap size={12} />}
                {c.type === 'lab' ? 'Lab' : 'Path'}
              </span>
            </div>
            <h2>{c.title}</h2>
            <p>{c.description}</p>
            <span className="learn-card-meta">
              {c.articles.length} {c.type === 'lab' ? 'steps' : 'articles'}
            </span>
            <span className="learn-card-cta">
              {c.type === 'lab' ? 'Start lab' : 'Start learning'} <ChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Course Detail (article list within a course)
// -------------------------------------------------------------------

function CourseDetail({ course }: { course: LearnCourse }) {
  return (
    <div className="learn-index">
      <div className="learn-index-hero">
        <div className="learn-course-header">
          <span className="learn-course-icon">{course.icon}</span>
          <span className={`learn-card-badge learn-card-badge--${course.type}`}>
            {course.type === 'lab' ? <FlaskConical size={12} /> : <GraduationCap size={12} />}
            {course.type === 'lab' ? 'Lab' : 'Learning Path'}
          </span>
        </div>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>
      <div className="learn-card-grid">
        {course.articles.map((a) => (
          <button
            key={a.slug}
            className="learn-card"
            onClick={() => navigate({ page: 'learn', courseSlug: course.slug, articleSlug: a.slug })}
          >
            <span className="learn-card-order">
              {course.type === 'lab' ? `Step ${a.order}` : a.order}
            </span>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
            <span className="learn-card-cta">
              {course.type === 'lab' ? 'Open step' : 'Read article'} <ChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Article View
// -------------------------------------------------------------------

function ArticleView({
  article,
  course,
  darkMode,
}: {
  article: LearnArticle;
  course: LearnCourse;
  darkMode: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const nextArticle = useMemo(
    () => course.articles.find((a) => a.order === article.order + 1),
    [course.articles, article.order],
  );
  const prevArticle = useMemo(
    () => course.articles.find((a) => a.order === article.order - 1),
    [course.articles, article.order],
  );

  // Replace <ontology-embed> placeholders with live widgets
  useEffect(() => {
    if (!contentRef.current) return;
    const placeholders = contentRef.current.querySelectorAll('ontology-embed');
    for (const el of placeholders) {
      const id = el.getAttribute('id');
      const height = el.getAttribute('height') || '400px';
      if (!id) continue;
      // Replace with an EmbedSlot
      const wrapper = document.createElement('div');
      wrapper.className = 'learn-embed-slot';
      wrapper.style.height = height;
      wrapper.dataset.catalogueId = id;
      wrapper.dataset.theme = darkMode ? 'dark' : 'light';
      el.replaceWith(wrapper);
    }
  }, [article.slug, darkMode]);

  // Hydrate embed slots with real ontology data
  useEffect(() => {
    if (!contentRef.current) return;
    const slots = contentRef.current.querySelectorAll<HTMLElement>('.learn-embed-slot');
    if (slots.length === 0) return;

    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}catalogue.json`)
      .then((res) => res.json() as Promise<Catalogue>)
      .then((catalogue) => {
        if (cancelled) return;
        for (const slot of slots) {
          const id = slot.dataset.catalogueId;
          const entry = catalogue.entries.find((e) => e.id === id);
          if (!entry) {
            slot.innerHTML = `<div class="learn-embed-error">Ontology "${id}" not found in catalogue</div>`;
            continue;
          }
          renderEmbedSlot(slot, entry, darkMode);
        }
      })
      .catch(() => {
        if (cancelled) return;
        for (const slot of slots) {
          slot.innerHTML = '<div class="learn-embed-error">Failed to load catalogue</div>';
        }
      });
    return () => { cancelled = true; };
  }, [article.slug, darkMode]);

  return (
    <div className="learn-article">
      <article className="learn-article-content" ref={contentRef}>
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: article.html }} />
      </article>
      <nav className="learn-article-nav">
        {prevArticle ? (
          <button
            className="learn-nav-btn learn-nav-prev"
            onClick={() => navigate({ page: 'learn', courseSlug: course.slug, articleSlug: prevArticle.slug })}
          >
            <ArrowLeft size={16} />
            <div>
              <span className="learn-nav-label">Previous</span>
              <span className="learn-nav-title">{prevArticle.title}</span>
            </div>
          </button>
        ) : (
          <div />
        )}
        {nextArticle && (
          <button
            className="learn-nav-btn learn-nav-next"
            onClick={() => navigate({ page: 'learn', courseSlug: course.slug, articleSlug: nextArticle.slug })}
          >
            <div>
              <span className="learn-nav-label">Next</span>
              <span className="learn-nav-title">{nextArticle.title}</span>
            </div>
            <ChevronRight size={16} />
          </button>
        )}
      </nav>
    </div>
  );
}

// -------------------------------------------------------------------
// Inline embed renderer (lightweight — uses cytoscape directly)
// -------------------------------------------------------------------

interface EmbedOntology {
  entityTypes: Array<{ id: string; name: string; icon: string; color: string }>;
  relationships: Array<{ id: string; name: string; from: string; to: string }>;
}

function renderEmbedSlot(
  slot: HTMLElement,
  entry: { name: string; ontology: EmbedOntology },
  darkMode: boolean,
) {
  const nodes = entry.ontology.entityTypes.map((e) => ({
    data: { id: e.id, label: `${e.icon} ${e.name}`, color: e.color },
  }));
  const edges = entry.ontology.relationships.map((r) => ({
    data: { id: r.id, source: r.from, target: r.to, label: r.name },
  }));

  const colors = darkMode
    ? { nodeText: '#B3B3B3', edgeColor: '#505050', edgeText: '#808080', bg: '#1E1E1E' }
    : { nodeText: '#2A2A2A', edgeColor: '#888888', edgeText: '#555555', bg: '#FCFCFC' };

  slot.style.background = colors.bg;
  slot.style.borderRadius = '8px';
  slot.style.border = `1px solid ${darkMode ? '#404040' : '#C0C0C0'}`;
  slot.innerHTML = '';

  // Title bar
  const titleBar = document.createElement('div');
  titleBar.style.cssText = `padding:8px 12px;font:600 13px/1 'Segoe UI',sans-serif;color:${darkMode ? '#B3B3B3' : '#444'};border-bottom:1px solid ${darkMode ? '#404040' : '#C0C0C0'}`;
  titleBar.textContent = entry.name;
  slot.appendChild(titleBar);

  // Graph container
  const graphDiv = document.createElement('div');
  graphDiv.style.cssText = 'flex:1;width:100%;height:calc(100% - 33px)';
  slot.style.display = 'flex';
  slot.style.flexDirection = 'column';
  slot.appendChild(graphDiv);

  import('cytoscape').then(({ default: cytoscape }) => {
    import('cytoscape-fcose').then(({ default: fcose }) => {
      cytoscape.use(fcose);
      cytoscape({
        container: graphDiv,
        elements: [...nodes, ...edges],
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '11px',
              'font-family': 'Segoe UI, sans-serif',
              'font-weight': 600,
              color: colors.nodeText,
              'text-margin-y': 6,
              width: 48,
              height: 48,
              'background-color': 'data(color)',
              'border-width': 2,
              'border-color': 'data(color)',
              'border-opacity': 0.5,
            },
          },
          {
            selector: 'edge',
            style: {
              label: 'data(label)',
              'font-size': '9px',
              'font-family': 'Segoe UI, sans-serif',
              color: colors.edgeText,
              'text-rotation': 'autorotate',
              'text-margin-y': -6,
              width: 1.5,
              'line-color': colors.edgeColor,
              'target-arrow-color': colors.edgeColor,
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
            },
          },
        ],
        layout: {
          name: 'fcose',
          animate: false,
          fit: true,
          padding: 30,
          nodeDimensionsIncludeLabels: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        minZoom: 0.3,
        maxZoom: 3,
        userPanningEnabled: true,
        userZoomingEnabled: true,
        boxSelectionEnabled: false,
      });
    });
  });
}
