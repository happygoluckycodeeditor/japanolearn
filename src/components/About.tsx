import React from "react";

const About: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">About Japanolearn</h1>
      <p className="mb-4">
        Japanolearn is a Japanese learning platform created to help users learn
        Japanese through lessons, exercises, a dictionary, and AI-powered
        assistance. The platform was designed with the aim of providing
        accessible and affordable education, particularly for people in
        developing countries where hiring a teacher may be difficult or too
        costly. With Japanolearn, learners can access high-quality language
        education from anywhere, helping bridge the gap in learning resources.
      </p>
      <p className="mb-4">
      発展途上国には、日本語を学びたいと願う人が多いですが、教師を雇ったり、語学学校に通ったりする経済的な余裕がない場合が多いです。
      私自身も大学で日本語を学ぶ時に、教育リソースが限られている状況で学習する大変さを経験しました。
      そこで、そんな経済的に困っている学習者を支援するために、AI技術を活用して日本語学習をもっと手軽にできるようにしたいと考え、JapanoLearnを開発しました。
      </p>
      <h2 className="text-2xl font-semibold mb-2">Contribution to SDGs</h2>
      <p className="mb-4">
        Japanolearn aligns with several Sustainable Development Goals (SDGs), particularly:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li><strong>SDG 4: Quality Education</strong> - By providing free or affordable access to language education through AI, Japanolearn supports inclusive and equitable quality education for all.</li>
        <li><strong>SDG 10: Reduced Inequalities</strong> - By offering a digital solution, Japanolearn helps reduce educational inequalities between people in developed and developing countries.</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Credits</h2>
      <ul className="list-disc list-inside mb-4">
        <li>React</li>
        <li>Vite</li>
        <li>Firebase</li>
        <li>Google Cloud AI - Gemini Model</li>
        <li>Algolia</li>
        <li>TailwindCSS</li>
        <li>DaisyUI</li>
        <li>Fuse.js</li>
        <li>JMDict Open source Dictionary</li>
        <li>YouTube API</li>
        <li>Google Sign-In</li>
        <li>And all other open-source tools and libraries used to make this project possible.</li>
      </ul>
      <p>I sincerely thank everyone who contributed to my small passion Project. I love all of you. 🥰</p>
      <p>Made by Tanmay, made in Tokyo 🥰</p>
    </div>
  );
};

export default About;
