const columns = [
  { title: "Support", links: ["Help Center", "Safety information", "Cancellation options", "Our COVID-19 Response", "Accessibility"] },
  { title: "Community", links: ["Airbnb.org", "Support Afghan refugees", "Celebrating diversity & belonging", "Combating discrimination"] },
  { title: "Hosting", links: ["Try hosting", "AirCover for Hosts", "Explore hosting resources", "Community forum", "Host responsibly"] },
  { title: "About", links: ["Newsroom", "New features", "Letter from our founders", "Careers", "Investors"] },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-columns page-shell">
        {columns.map((column) => (
          <section key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => <a href="#footer" key={link}>{link}</a>)}
          </section>
        ))}
      </div>
      <div className="footer-bottom page-shell">
        <span>© 2026 Airbnb Clone · Privacy · Terms · Sitemap</span>
        <span>◎ English (US) &nbsp; $ USD &nbsp; ● ● ●</span>
      </div>
    </footer>
  );
}
