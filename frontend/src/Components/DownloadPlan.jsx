"use client";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    color: "#22c55e",
    borderBottom: "2 solid #000",
  },
  subtitle: {
    fontSize: 14,
    color: "#3b82f6",
    marginBottom: 2,
  },

  smallText: {
    fontSize: 12,
  },
  flexRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    gap: 3,
    maxWidth: 1200,
  },
  flexCol: {
    flex: 1,
    marginBottom: 4,
  },
  interventionCol: {
    flex: 1.6, // Takes up twice as much space as any other flexCol
  },
  boldText: {
    fontSize: 13,
  },
});

function stripHtml(html) {
  return html?.replace(/<[^>]*>?/gm, "");
}

const DownloadPlan = ({ documentData, sessionData }) => {
  const problemText = documentData?.problem
    ? stripHtml(documentData?.problem)
    : "No problem statement";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>
            {sessionData?.type === "notes"
              ? sessionData?.title
              : documentData?.title}
          </Text>
          {sessionData.type === "notes" && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.subtitle}>Transcript</Text>
              <Text style={styles.smallText}>
                {stripHtml(sessionData?.notes)}
              </Text>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.subtitle}>Recommendation</Text>
                {sessionData?.recommendation?.map((recom, i) => (
                  <Text key={i} style={styles.smallText}>
                    {recom}
                  </Text>
                ))}
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.subtitle}>
                  Prescribed Frequency of Treatment
                </Text>
                <Text style={styles.smallText}>
                  {(sessionData?.frequency)}
                </Text>
              </View>
            </View>
          )}
          {sessionData?.type === "notes" && (
            <Text style={{ marginTop: 6, color: "#22c55e", fontSize: 18 }}>
              Plan
            </Text>
          )}
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Diagnosis</Text>
            <Text style={styles.smallText}>
              {documentData?.diagnosis?.description}
            </Text>
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Justification</Text>
            <Text style={styles.smallText}>{documentData?.justification}</Text>
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Problem Statement</Text>
            <Text style={styles.smallText}>{problemText}</Text>
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Treatment Goal</Text>
          </View>
          {documentData?.goals?.map((goal, goalInd) => (
            <View key={goalInd}>
              <Text style={styles.smallText}>{stripHtml(goal?.title)}</Text>
              {goal?.objectives?.map((objective, objInd) => (
                <View key={objInd}>
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.subtitle}>
                      {stripHtml(objective?.title)}
                    </Text>
                    <Text style={styles.smallText}>
                      {stripHtml(objective?.objectiveValue)}
                    </Text>
                  </View>
                  <View style={{ ...styles.flexRow, marginTop: 6 }}>
                    <Text style={styles.subtitle}>Duration:</Text>
                    <Text style={styles.smallText}>
                      {stripHtml(objective?.duration)}
                    </Text>
                  </View>
                  <Text style={{ ...styles.subtitle, marginTop: 6 }}>
                    Strategy
                  </Text>
                  {objective.strategy?.map((strat, stratIndex) => (
                    <View style={styles.flexRow} key={stratIndex}>
                      <View style={styles.interventionCol}>
                        <Text style={styles.boldText}>Intervention</Text>
                        <Text style={styles.smallText}>
                          {stripHtml(strat?.intervention)}
                        </Text>
                      </View>
                      <View style={styles.flexCol}>
                        <Text style={styles.boldText}>Modality</Text>
                        <Text style={styles.smallText}>
                          {stripHtml(strat?.modality)}
                        </Text>
                      </View>
                      <View style={styles.flexCol}>
                        <Text style={styles.boldText}>Frequency</Text>
                        <Text style={styles.smallText}>
                          {stripHtml(strat?.frequency)}
                        </Text>
                      </View>
                      <View style={styles.flexCol}>
                        <Text style={styles.boldText}>Completion</Text>
                        <Text style={styles.smallText}>
                          {stripHtml(strat?.completion)}
                        </Text>
                      </View>
                      <View style={styles.flexCol}>
                        <Text style={styles.boldText}>Status</Text>
                        <Text style={styles.smallText}>
                          {stripHtml(strat?.status)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Discharge Criteria/Planning</Text>
            <Text style={styles.smallText}>
              {stripHtml(documentData?.discharge)}
            </Text>
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Additional Information</Text>
            <Text style={styles.smallText}>
              {stripHtml(documentData?.AdditionalInfo)}
            </Text>
          </View>
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subtitle}>Frequency of Treatment</Text>
            <Text style={styles.smallText}>{documentData?.frequency}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DownloadPlan;
