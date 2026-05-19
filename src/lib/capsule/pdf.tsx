import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { CapsuleContent } from "@/types/capsule";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FDFAF6",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottom: 1,
    borderBottomColor: "#7B5EA7",
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: {
    fontSize: 9,
    color: "#7B5EA7",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B2838",
    marginBottom: 8,
  },
  intro: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#555",
    lineHeight: 1.5,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F4EFFD",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: "space-around",
  },
  statBox: { alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7B5EA7",
  },
  statLabel: {
    fontSize: 8,
    color: "#666",
    textTransform: "capitalize",
    marginTop: 2,
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B2838",
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    fontSize: 11,
    color: "#333",
    marginBottom: 5,
    lineHeight: 1.4,
  },
  itemBullet: { color: "#7B5EA7", marginRight: 6 },
  itemText: { flex: 1 },
  messageBox: {
    backgroundColor: "#F4EFFD",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    borderLeft: 3,
    borderLeftColor: "#7B5EA7",
  },
  messageLabel: {
    fontSize: 9,
    color: "#7B5EA7",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#1B2838",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTop: 0.5,
    borderTopColor: "#CCC",
    paddingTop: 8,
  },
});

function CapsulePdfDocument({ content }: { content: CapsuleContent }) {
  return (
    <Document
      title={content.title}
      author="Darons"
      subject="Capsule familiale"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>La Capsule · Darons</Text>
          <Text style={styles.title}>{content.title}</Text>
          {content.intro && <Text style={styles.intro}>{content.intro}</Text>}
        </View>

        {content.stats && Object.keys(content.stats).length > 0 && (
          <View style={styles.statsRow}>
            {Object.entries(content.stats)
              .slice(0, 4)
              .map(([key, value]) => (
                <View key={key} style={styles.statBox}>
                  <Text style={styles.statValue}>{String(value)}</Text>
                  <Text style={styles.statLabel}>{key.replace(/_/g, " ")}</Text>
                </View>
              ))}
          </View>
        )}

        {content.sections.map((section, idx) => (
          <View key={idx} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemBullet}>•</Text>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {content.message_for_later && (
          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Pour toi, plus tard</Text>
            <Text style={styles.messageText}>{content.message_for_later}</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          Généré par Darons — darons.app
        </Text>
      </Page>
    </Document>
  );
}

export async function renderRecapPdf(content: CapsuleContent): Promise<Buffer> {
  return renderToBuffer(<CapsulePdfDocument content={content} />);
}
