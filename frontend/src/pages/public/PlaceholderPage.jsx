const PlaceholderPage = ({ title, note }) => (
  <main className="placeholder">
    <div className="placeholder__inner">
      <h1>{title}</h1>
      <p>{note || 'This screen will be built in a later development phase.'}</p>
    </div>
  </main>
);

export default PlaceholderPage;
